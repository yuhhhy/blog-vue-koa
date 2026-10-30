const categoryOf = (link) => link.category || 'friend'

export const reorderLinksWithinCategory = (links, draggedId, targetId, step = 10) => {
  const dragged = links.find((link) => link.id === draggedId)
  const target = links.find((link) => link.id === targetId)
  if (!dragged || !target || categoryOf(dragged) !== categoryOf(target)) return []

  const categoryLinks = links.filter((link) => categoryOf(link) === categoryOf(dragged))
  const fromIndex = categoryLinks.findIndex((link) => link.id === draggedId)
  const targetIndex = categoryLinks.findIndex((link) => link.id === targetId)
  if (fromIndex === targetIndex) return []

  const [moved] = categoryLinks.splice(fromIndex, 1)
  categoryLinks.splice(targetIndex, 0, moved)

  return categoryLinks
    .map((link, index) => ({ ...link, sortOrder: (index + 1) * step }))
    .filter((link) => Number(link.sortOrder) !== Number(links.find((item) => item.id === link.id)?.sortOrder))
}
