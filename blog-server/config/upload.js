import multer from '@koa/multer'

// 设置文件上传后的存储路径和文件名
export const storage = multer.diskStorage({
    // 设置文件存储路径
    destination: function (req, file, cb) {
        cb(null, '../public/images/')
    },
    // 设置文件名（保持原始文件名不变）
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})