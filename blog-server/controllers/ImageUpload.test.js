import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import router from '../routes/api.js'
import { reuploadImageFile } from './FilesController.js'

const uploadHandler = router.stack
    .find((layer) => layer.path === '/api/upload/image')
    .stack.at(-1)

test('image uploads keep AVIF compression without generating thumbnails', async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'image-upload-'))
    t.after(() => fs.rm(directory, { recursive: true, force: true }))
    const sourcePath = path.join(directory, 'photo.png')
    await sharp({
        create: { width: 64, height: 32, channels: 3, background: '#aabbcc' },
    })
        .png()
        .toFile(sourcePath)
    const ctx = {
        request: {
            body: { convertToAvif: 'true' },
            file: {
                path: sourcePath,
                destination: directory,
                filename: 'photo.png',
                originalname: 'photo.png',
                mimetype: 'image/png',
            },
        },
    }
    await uploadHandler(ctx)
    assert.equal(ctx.status, 200)
    assert.equal(ctx.body.filename, 'photo.avif')
    assert.deepEqual(await fs.readdir(directory), ['photo.avif'])
    const metadata = await sharp(path.join(directory, 'photo.avif')).metadata()
    assert.equal(metadata.format, 'heif')
    assert.equal(metadata.compression, 'av1')
    assert.equal(metadata.width, 64)
    assert.equal(metadata.height, 32)
})

test('uploads without conversion retain only the uploaded file', async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'image-upload-'))
    t.after(() => fs.rm(directory, { recursive: true, force: true }))
    const sourcePath = path.join(directory, 'photo.png')
    await sharp({
        create: { width: 32, height: 16, channels: 3, background: '#aabbcc' },
    })
        .png()
        .toFile(sourcePath)
    const ctx = {
        request: {
            body: {},
            file: {
                path: sourcePath,
                destination: directory,
                filename: 'photo.png',
                mimetype: 'image/png',
            },
        },
    }
    await uploadHandler(ctx)
    assert.equal(ctx.status, 200)
    assert.deepEqual(await fs.readdir(directory), ['photo.png'])
})

test('reuploading removes legacy thumbnails without regenerating them', async (t) => {
    t.mock.method(fs, 'access', async () => {})
    const rename = t.mock.method(fs, 'rename', async () => {})
    const unlink = t.mock.method(fs, 'unlink', async () => {})
    const ctx = {
        params: { filename: 'photo.avif' },
        request: {
            file: {
                path: '/virtual/upload.avif',
                originalname: 'upload.avif',
                mimetype: 'image/avif',
            },
        },
    }
    await reuploadImageFile(ctx)
    assert.equal(ctx.status, 200)
    assert.equal(rename.mock.calls.length, 1)
    assert.deepEqual(
        unlink.mock.calls
            .map((call) => path.basename(call.arguments[0]))
            .sort(),
        ['photo_360.avif', 'photo_720.avif', 'photo_960.avif'],
    )
})

test('the manual thumbnail generation endpoint is removed', () => {
    assert.equal(
        router.stack.some(
            (layer) =>
                layer.path === '/api/files/images/:filename(.+)/variants',
        ),
        false,
    )
})
