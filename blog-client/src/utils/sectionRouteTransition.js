let homeSectionAnimator = null
let pendingReturn = null

export const registerHomeSectionAnimator = (animator) => {
    homeSectionAnimator = animator

    return () => {
        if (homeSectionAnimator === animator) homeSectionAnimator = null
    }
}

export const runHomeSectionAnimation = async (section) => {
    if (!homeSectionAnimator) return
    await homeSectionAnimator(section)
}

export const queueHomeReturnAnimation = (section, target = null) => {
    if (pendingReturn?.target && !target) return
    pendingReturn = { section, target }
}

export const consumeHomeReturnAnimation = () => {
    const animation = pendingReturn
    pendingReturn = null
    return animation
}
