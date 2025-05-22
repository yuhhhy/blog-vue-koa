/**
 * Upload Controller
 */

export const uploadImage = async (ctx) => {
    ctx.status = 200
    ctx.body = ctx.request.file
}