// 处理直接放在服务器目录下的文件，而不是数据库内的文件
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import {
    deleteImageVariants,
    generateImageVariants,
    getImageVariantPath,
    imageVariantWidths,
    isImageVariantFile
} from "../utils/imageVariants.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imageDir = path.join(__dirname, "..", "..", "public", "images");
const mdDir = path.join(__dirname, "..", "..", "public", "mds");

const ensureDir = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
}

const supportedImageExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp']);

const getSafeImageFilename = (filename) => {
    const safeFilename = path.posix.normalize((filename || '').replace(/\\/g, '/'));

    if (!safeFilename || safeFilename === '.' || safeFilename === '..' || safeFilename.startsWith('../') || path.isAbsolute(safeFilename)) {
        const error = new Error('图片文件名不合法');
        error.status = 400;
        throw error;
    }

    return safeFilename;
}

const getImageFilePath = (filename) => path.join(imageDir, ...filename.split('/'));

const getImageUrl = (filename) => {
    return `/images/${filename.split('/').map((item) => encodeURIComponent(item)).join('/')}`;
}

const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
    }
}

const getImageVariantInfo = async (dir, filename) => {
    const variants = {};

    await Promise.all(imageVariantWidths.map(async (width) => {
        variants[width] = await fileExists(getImageVariantPath(dir, width, filename));
    }));

    return {
        widths: imageVariantWidths,
        variants,
        hasAllVariants: imageVariantWidths.every((width) => variants[width]),
    };
}

const collectImages = async (dir) => {
    const imageList = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const filePath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            imageList.push(...await collectImages(filePath));
            continue;
        }

        if (!entry.isFile() || isImageVariantFile(entry.name) || !supportedImageExtensions.has(path.extname(entry.name).toLowerCase())) {
            continue;
        }

        const stats = await fs.stat(filePath);
        const filename = path.relative(imageDir, filePath).split(path.sep).join('/');
        const variantInfo = await getImageVariantInfo(path.dirname(filePath), entry.name);

        imageList.push({
            name: filename, // 文件名
            url: getImageUrl(filename), // 可访问的 URL
            size: stats.size, // 文件大小
            uploadDate: stats.birthtime, // 上传日期
            uploadTime: stats.birthtimeMs || stats.mtimeMs,
            variantWidths: variantInfo.widths,
            variants: variantInfo.variants,
            hasAllVariants: variantInfo.hasAllVariants,
        });
    }

    return imageList;
}

// 获取图片列表
export const getImageFiles = async (ctx) => {
    try {
        const imageList = [];

        await ensureDir(imageDir);
        imageList.push(...await collectImages(imageDir));

        imageList.sort((a, b) => b.uploadTime - a.uploadTime);

        ctx.status = 200;
        ctx.body = { success: true, data: imageList };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '获取图片列表失败', error: error.message };
        return;
    }
};

// 重新上传图片，保持原文件名和访问地址不变
export const reuploadImageFile = async (ctx) => {
    let uploadedPath;

    try {
        const filename = getSafeImageFilename(ctx.params.filename);
        const file = ctx.request.file;

        if (!file?.mimetype?.startsWith('image/')) {
            ctx.status = 400;
            ctx.body = { success: false, message: '请上传图片文件' };
            return;
        }

        uploadedPath = file.path;
        const targetPath = getImageFilePath(filename);
        const targetExists = await fileExists(targetPath);

        if (!targetExists) {
            ctx.status = 404;
            ctx.body = { success: false, message: '原图片不存在' };
            return;
        }

        const targetExt = path.extname(filename).toLowerCase();
        const uploadExt = path.extname(file.originalname || file.filename).toLowerCase();

        if (targetExt !== uploadExt) {
            ctx.status = 400;
            ctx.body = { success: false, message: '重传图片需要和原图片保持相同扩展名' };
            return;
        }

        if (uploadedPath !== targetPath) {
            await fs.rename(uploadedPath, targetPath);
            uploadedPath = null;
        }

        await generateImageVariants(targetPath, path.basename(filename), path.dirname(targetPath));

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: '图片重传成功',
            data: {
                name: filename,
                url: getImageUrl(filename),
                ...(await getImageVariantInfo(path.dirname(targetPath), path.basename(filename))),
            },
        };
    } catch (error) {
        ctx.status = error.status || 500;
        ctx.body = { success: false, message: '图片重传失败', error: error.message };
    } finally {
        if (uploadedPath) {
            try {
                await fs.unlink(uploadedPath);
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
            }
        }
    }
};

// 为指定图片生成缩略图
export const generateImageFileVariants = async (ctx) => {
    try {
        const filename = getSafeImageFilename(ctx.params.filename);

        if (isImageVariantFile(filename) || !supportedImageExtensions.has(path.extname(filename).toLowerCase())) {
            ctx.status = 400;
            ctx.body = { success: false, message: '不支持为该文件生成缩略图' };
            return;
        }

        const filePath = getImageFilePath(filename);

        if (!(await fileExists(filePath))) {
            ctx.status = 404;
            ctx.body = { success: false, message: '图片不存在' };
            return;
        }

        await generateImageVariants(filePath, path.basename(filename), path.dirname(filePath));

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: '缩略图生成成功',
            data: await getImageVariantInfo(path.dirname(filePath), path.basename(filename)),
        };
    } catch (error) {
        ctx.status = error.status || 500;
        ctx.body = { success: false, message: '缩略图生成失败', error: error.message };
    }
};

// 删除图片文件
export const deleteImageFile = async (ctx) => {
    const filename = getSafeImageFilename(ctx.params.filename);
    const filePath = getImageFilePath(filename);
    try {
        await fs.unlink(filePath);
        await deleteImageVariants(path.dirname(filePath), path.basename(filename));
        ctx.status = 200;
        ctx.body = { success: true, message: '图片删除成功' };
    }   catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '图片删除失败', error: error.message };
    } 
};

// 获取 Markdown 文件列表
export const getMdFiles = async (ctx) => {
  try {
    await ensureDir(mdDir);
    const files = await fs.readdir(mdDir);
    const mdList = [];
    for (const file of files) {
      if (path.extname(file).toLowerCase() === ".md") {
        const filePath = path.join(mdDir, file);
        const stats = await fs.stat(filePath);
        mdList.push({
          name: file,
          url: `/mds/${file}`,
          size: stats.size,
          uploadDate: stats.birthtime,
          uploadTime: stats.birthtimeMs || stats.mtimeMs,
        });
      }
    }

    mdList.sort((a, b) => b.uploadTime - a.uploadTime);

    ctx.body = { success: true, data: mdList };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: "获取 Markdown 文件列表失败" };
  }
};

// 删除 Markdown 文件
export const deleteMdFile = async (ctx) => {
  const { filename } = ctx.params;
  try {
    const filePath = path.join(mdDir, filename);
    await fs.unlink(filePath);
    ctx.body = { success: true, message: "删除成功" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: "删除失败" };
  }
};
