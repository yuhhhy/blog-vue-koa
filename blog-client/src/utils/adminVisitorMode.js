export const ADMIN_VISITOR_QUERY_KEY = 'visitor'
export const ADMIN_VISITOR_QUERY_VALUE = 'admin'

const initialSearch = typeof window === 'undefined' ? '' : window.location.search
let adminVisitorMode = new URLSearchParams(initialSearch).get(ADMIN_VISITOR_QUERY_KEY) === ADMIN_VISITOR_QUERY_VALUE

export const hasAdminVisitorQuery = (query = {}) => {
    const value = query[ADMIN_VISITOR_QUERY_KEY]
    return Array.isArray(value)
        ? value.includes(ADMIN_VISITOR_QUERY_VALUE)
        : value === ADMIN_VISITOR_QUERY_VALUE
}

export const createAdminVisitorRedirect = (route, enabled) => {
    if (!enabled || hasAdminVisitorQuery(route.query)) return null

    return {
        path: route.path,
        query: {
            ...route.query,
            [ADMIN_VISITOR_QUERY_KEY]: ADMIN_VISITOR_QUERY_VALUE,
        },
        hash: route.hash,
        replace: true,
    }
}

export const syncAdminVisitorMode = (route) => {
    if (hasAdminVisitorQuery(route?.query)) adminVisitorMode = true
    return adminVisitorMode
}

export const getAdminVisitorRedirect = (route) => (
    createAdminVisitorRedirect(route, syncAdminVisitorMode(route))
)

export const isAdminVisitorMode = () => adminVisitorMode
