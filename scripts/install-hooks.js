// Production deployments and CI do not need local Git hooks.
if (
    !process.env.CI &&
    process.env.NODE_ENV !== 'production' &&
    process.env.HUSKY !== '0'
) {
    try {
        const { default: husky } = await import('husky')
        const message = husky()
        if (message) console.log(message)
    } catch (error) {
        if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
    }
}
