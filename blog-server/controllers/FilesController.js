// 处理直接放在服务器目录下的文件，而不是数据库内的文件
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imageDir = path.join(__dirname, "..", "..", "public", "images");
const mdDir = path.join(__dirname, "..", "..", "public", "mds");

// 获取图片列表
export const getImageFiles = async (ctx) => {
    try {
        const imageList = [];

        await fs.access(imageDir);
        const files = await fs.readdir(imageDir);

        for (const file of files) {
            const filePath = path.join(imageDir, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                imageList.push({
                    name: file, // 文件名
                    url: `/images/${file}`, // 可访问的 URL
                    size: stats.size, // 文件大小
                    uploadDate: stats.birthtime, // 上传日期
                });
            }
        }
        ctx.status = 200;
        ctx.body = { success: true, data: imageList };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '获取图片列表失败', error: error.message };
        return;
    }
};

// 删除图片文件
export const deleteImageFile = async (ctx) => {
    const { filename } = ctx.params;
    const filePath = path.join(imageDir, filename);
    try {
        await fs.unlink(filePath);
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
    // 确保目录存在，如果不存在则创建

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
        });
      }
    }
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
