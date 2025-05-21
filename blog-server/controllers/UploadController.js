/**
 * Upload Controller
 */

export const uploadImage = async (ctx) => {
    console.log('file', ctx.request.file);
    ctx.status = 200
    ctx.body = "success"
}