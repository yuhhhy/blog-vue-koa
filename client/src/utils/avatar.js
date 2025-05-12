import sha256 from 'crypto-js/sha256'

// 生成Gravatar头像的hash值
export function getGravatarHash(email) {
    email = email.trim().toLowerCase()
    const hash = sha256(email).toString()
    return hash
}

// 生成Gravatar头像的URL
export async function getGravatar(hash) {
    const res = await fetch(`https://api.gravatar.com/v3/profiles/${hash}`)
    if (res.ok) {
        const data = await res.json()
        return data
    } else {
        return {}
    }
}