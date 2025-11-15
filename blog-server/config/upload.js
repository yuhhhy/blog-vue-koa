import multer from '@koa/multer'

// 设置文件上传后的存储路径和文件名
export const storage = multer.diskStorage({
    // 设置文件存储路径
    destination: function (req, file, cb) {
        console.log("文件信息：", file);
        if (file.mimetype.startsWith("image/")) {
           cb(null, "../public/images/");
        } else {
            cb(null, "../public/mds/");
        }
    },
    // 设置文件名（保持原始文件名不变）
    filename: function (req, file, cb) {
        // 解决中文文件名乱码问题
        const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, filename)
    }
})
