import logger from '../config/logger.js'
import { generateLatestPostsRSS } from '../utils/RSS.js'

export const refreshRSS = async (reason = 'content changed') => {
    try {
        const result = await generateLatestPostsRSS()
        logger.info(`[RSS] Feed generated with ${result.count} posts (${reason})`)
        return result
    } catch (error) {
        logger.error(`[RSS] Feed generation failed (${reason}): ${error.stack || error.message}`)
        return null
    }
}
