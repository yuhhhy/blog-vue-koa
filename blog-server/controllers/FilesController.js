// 处理直接放在服务器目录下的文件，而不是数据库内的文件
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imageDir = path.join(__dirname, "..", "..", "public", "images");

export const getImageFiles = async (ctx) => {
    const imageList = [];
    try {
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
    } catch (error) {
        if (error.code === 'ENOENT') {
            ctx.status = 200;
            ctx.body = { success: true, data: [] };
            return; // 目录不存在，返回空列表
        }
        ctx.status = 500;
        ctx.body = { success: false, message: '获取图片列表失败', error: error.message };
        return;
    }
    ctx.status = 200;
    ctx.body = { success: true, data: imageList };
};

export const deleteImageFile = async (ctx) => {
    const { filename } = ctx.params;
    const filePath = path.join(imageDir, filename);
    console.log("Deleting file:", filePath);
    try {
        await fs.unlink(filePath);
        ctx.status = 200;
        ctx.body = { success: true, message: '图片删除成功' };
    }   catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: '图片删除失败', error: error.message };
    } 
};
