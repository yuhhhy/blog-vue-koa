import sha256 from 'crypto-js/sha256'

// 生成Gravatar头像的hash值
export function getGravatarHash(email) {
    email = email.trim().toLowerCase()
    const hash = sha256(email).toString()
    return hash
}

// 生成Gravatar头像的URL
export async function getGravatar(hash) {
    try {
        const res = await fetch(`https://cdn.v2ex.com/gravatar/${hash}`)
        return res.url
    } catch (error) {
        return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
    
}

// V2EX - 国内Gravatar镜像
// (hash) => `https://cdn.v2ex.com/gravatar/${hash}?s=200&d=mp`,
// 七牛云 - Gravatar镜像
// (hash) => `https://dn-qiniu-avatar.qbox.me/avatar/${hash}?s=200&d=mp`,