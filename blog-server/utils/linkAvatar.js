import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import sharp from 'sharp'

const cache = new Map(), pending = new Map()
const MAX_SOURCE = 3 * 1024 * 1024

export const isPublicIPv4 = (address) => {
    const parts = address.split('.').map(Number)
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false
    const [a,b,c] = parts
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254)
        || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
        || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19))
        || (a === 192 && b === 0) || (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113))
}

export async function fetchAvatarSource(value, redirects = 0, signal = AbortSignal.timeout(12000)) {
    const url = new URL(value)
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password
        || (url.port && !['80','443'].includes(url.port))) throw new Error('Unsupported avatar URL')
    // Pin a validated DNS result to the socket. Redirects are revalidated too.
    const addresses = await lookup(url.hostname, { family: 4, all: true })
    if (!addresses.length || addresses.some(({address}) => !isPublicIPv4(address))) throw new Error('Avatar host is not public')
    const address = addresses[0].address
    return new Promise((resolve,reject) => {
        const request = (url.protocol === 'https:' ? https : http).get(url, {
            signal,
            headers: { Accept: 'image/*', 'User-Agent': 'Blog-Avatar-Cache/1.0' },
            lookup: (_host, options, callback) => options.all ? callback(null,[{address,family:4}]) : callback(null,address,4),
        }, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume()
                if (redirects >= 3) { reject(new Error('Too many avatar redirects')); return }
                fetchAvatarSource(new URL(response.headers.location,url).href,redirects+1,signal).then(resolve,reject)
                return
            }
            if (response.statusCode !== 200 || !String(response.headers['content-type']).startsWith('image/')) {
                response.resume(); reject(new Error('Avatar is not an image')); return
            }
            let size=0; const chunks=[]
            response.on('data', chunk => {
                size+=chunk.length
                if (size>MAX_SOURCE) { request.destroy(new Error('Avatar exceeds size limit')); return }
                chunks.push(chunk)
            })
            response.on('end', () => resolve(Buffer.concat(chunks)))
            response.on('error',reject)
        })
        request.on('error',reject)
    })
}

export async function cachedLinkAvatar(url) {
    const existing=cache.get(url)
    if(existing && existing.expires>Date.now()) return existing.data
    if(pending.has(url)) return pending.get(url)
    const task=(async () => {
        const source=await fetchAvatarSource(url)
        const data=await sharp(source,{limitInputPixels:16_000_000}).rotate().resize(256,256,{fit:'cover'}).webp({quality:88}).toBuffer()
        if(cache.size>=128) cache.delete(cache.keys().next().value)
        cache.set(url,{data,expires:Date.now()+6*60*60*1000})
        return data
    })()
    pending.set(url,task)
    try { return await task } finally { pending.delete(url) }
}

export async function respondLinkAvatar(ctx, link) {
    if(!link?.avatar) { ctx.status=404; return }
    try {
        ctx.body=await cachedLinkAvatar(link.avatar)
        ctx.type='image/webp'
        ctx.set('Cache-Control','public, max-age=21600')
        ctx.set('X-Content-Type-Options','nosniff')
    } catch {
        ctx.status=502
        ctx.body={message:'Avatar unavailable'}
    }
}
