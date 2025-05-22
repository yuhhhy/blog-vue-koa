import multer from '@koa/multer'
import path from 'path'

// 设置文件上传后的存储路径和文件名
export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})