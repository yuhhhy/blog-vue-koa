import { getMockWebsiteData } from './websiteData.js'

const mockRoutes = new Map([
    ['GET /website', ({ params }) => getMockWebsiteData(params?.timeRange)]
])

const getRouteKey = (config) => {
    const method = config.method?.toUpperCase() || 'GET'
    const pathname = new URL(config.url, 'http://mock.local').pathname

    return `${method} ${pathname}`
}

const createMockAdapter = (handler) => async (config) => ({
    data: await handler(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: null
})

export function setupDevelopmentMocks(request) {
    request.interceptors.request.use((config) => {
        const handler = mockRoutes.get(getRouteKey(config))

        if (handler) {
            config.adapter = createMockAdapter(handler)
        }

        return config
    })
}
