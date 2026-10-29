export const LINK_SORT_STEP = 10

export const normalizeLinkCategory = (value) => (
    value === 'recommended' ? 'recommended' : 'friend'
)

export const normalizeLinkSortOrder = (value) => {
    const sortOrder = Number(value)
    return Number.isFinite(sortOrder) ? Math.max(0, Math.trunc(sortOrder)) : 0
}

export const getNextLinkSortOrder = (links, category) => {
    const normalizedCategory = normalizeLinkCategory(category)
    const categoryOrders = links
        .filter((link) => normalizeLinkCategory(link.category) === normalizedCategory)
        .map((link) => normalizeLinkSortOrder(link.sortOrder))

    return Math.max(0, ...categoryOrders) + LINK_SORT_STEP
}
