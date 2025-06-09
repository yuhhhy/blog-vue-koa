import sha256 from 'crypto-js/sha256'

// 获取QQ号
function getQQNumber(email) {
    if (!email.endsWith('@qq.com')) return null
    const qqNumber = email.split('@')[0]
    return /^\d+$/.test(qqNumber) ? qqNumber : null
}

// 生成头像url
export async function getAvatar(email) {
    try {

        // 1. 优先尝试获取Gravatar头像
        const hash = sha256(email.trim().toLowerCase()).toString()
        const gravatarUrls = [
            'https://weavatar.com/avatar/',
            'https://cdn.sep.cc/avatar/',
            'https://gravatar.zeruns.tech/avatar/',
            'https://cravatar.cn/avatar/',
            'https://dn-qiniu-avatar.qbox.me/avatar/'
        ]
        // 依次尝试不同的Gravatar镜像
        for (const url of gravatarUrls) {
            try {
                const response = await fetch(url + hash + '?s=200&d=mp')
                if (response.ok) {
                    return response.url
                }
            } catch {
                continue
            }
        }

        // 2. 尝试获取QQ头像
        const qqNumber = getQQNumber(email)
        if (qqNumber) {
            return `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`  // 获取QQ头像
                }
        
        // 3. 如果都失败了，返回默认头像
        return '/src/assets/images/user_default.png'
    } catch (error) {
        return '/src/assets/images/user_default.png'
    }
}