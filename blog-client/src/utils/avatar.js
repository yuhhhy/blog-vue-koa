import sha256 from 'crypto-js/sha256'

// 获取QQ号
function getQQNumber(email) {
    if (!email || !email.endsWith('@qq.com')) return null
    const qqNumber = email.split('@')[0]
    return /^\d+$/.test(qqNumber) ? qqNumber : null
}

// 生成头像url
export async function getAvatar(email) {
    if (!email) {
        return '/src/assets/images/user_default.png'
    }
    
    // 1. 尝试获取QQ头像（QQ邮箱优先级更高，通常更准确）
    try {
        const qqNumber = getQQNumber(email)
        if (qqNumber) {
            const qqAvatarUrl = `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`
            // 可以添加检查QQ头像是否有效的逻辑
            return qqAvatarUrl
        }
    } catch (error) {
        console.warn('获取QQ头像失败:', error)
        // 失败后继续尝试Gravatar
    }

    // 2. 尝试获取Gravatar头像
    try {
        const hash = sha256(email.trim().toLowerCase()).toString()
        const gravatarUrls = [
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
            } catch (error) {
                console.warn(`Gravatar镜像 ${url} 获取失败:`, error)
                continue  // 继续尝试下一个镜像
            }
        }
    } catch (error) {
        console.warn('获取Gravatar头像失败:', error)
        // 失败后继续尝试其他方法或返回默认头像
    }
    
    // 3. 如果以上都失败，返回默认头像
    return '/src/assets/images/user_default.png'
}