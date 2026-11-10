export const ADMIN_VISITOR_QUERY_KEY = 'visitor'
export const ADMIN_VISITOR_QUERY_VALUE = 'admin'

const initialSearch = typeof window === 'undefined' ? '' : window.location.search
const isAdminValue = (value) => typeof value === 'string'
    && value.toLowerCase() === ADMIN_VISITOR_QUERY_VALUE
let adminVisitorMode = new URLSearchParams(initialSearch).getAll(ADMIN_VISITOR_QUERY_KEY).some(isAdminValue)

export const hasAdminVisitorQuery = (query = {}) => {
    const value = query[ADMIN_VISITOR_QUERY_KEY]
    return Array.isArray(value)
        ? value.some(isAdminValue)
        : isAdminValue(value)
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
