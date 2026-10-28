import test from 'node:test'
import assert from 'node:assert/strict'
import { isPublicIPv4, respondLinkAvatar, fetchAvatarSource } from './linkAvatar.js'

test('avatar downloader rejects local, private and reserved destinations',async()=>{
    for(const ip of ['127.0.0.1','10.0.0.5','172.16.1.1','192.168.2.3','169.254.169.254','0.0.0.0','100.64.1.1','198.18.0.1','224.0.0.1','::1','127.0.0.1.evil']) assert.equal(isPublicIPv4(ip),false,ip)
    assert.equal(isPublicIPv4('8.8.8.8'),true)
    await assert.rejects(fetchAvatarSource('http://127.0.0.1/test.png'))
    await assert.rejects(fetchAvatarSource('file:///etc/passwd'))
    await assert.rejects(fetchAvatarSource('https://example.org:1234/a.png'))
})
test('avatar route requires an existing stored link',async()=>{
    const ctx={}
    await respondLinkAvatar(ctx,null)
    assert.equal(ctx.status,404)
})
