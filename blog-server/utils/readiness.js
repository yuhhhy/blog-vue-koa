import { constants } from 'fs'
import fs from 'fs/promises'
import mongoose from 'mongoose'
import envConfig from '../config/env.js'

export const checkReadiness = async ({
    useMockData = envConfig.useMockData,
    staticResourceFilePath = envConfig.staticResourceFilePath,
    databaseReady = mongoose.connection.readyState === 1,
    access = fs.access,
} = {}) => {
    const checks = {
        database: useMockData || databaseReady,
        storage: false,
    }

    try {
        await access(staticResourceFilePath, constants.R_OK | constants.W_OK)
        checks.storage = true
    } catch {
        checks.storage = false
    }

    return {
        ready: Object.values(checks).every(Boolean),
        dataSource: useMockData ? 'mock' : 'mongodb',
        checks,
    }
}
