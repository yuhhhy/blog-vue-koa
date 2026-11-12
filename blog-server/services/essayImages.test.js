import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
    cleanupEssayImages,
    getLocalEssayImageFilename,
    getImageReferencePattern,
} from './essayImages.js'
import { Essay } from '../models/EssaySchema.js'
import { EssayDraft } from '../models/EssayDraftSchema.js'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
import { ArticleDraft } from '../models/ArticleDraftSchema.js'
import { Links } from '../models/LinksSchema.js'
import { Comment } from '../models/CommentSchema.js'

const fixture = async (t) => {
    const imageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'essay-images-'))
    t.after(() => fs.rm(imageDir, { recursive: true, force: true }))
    const names = [
        'photo.avif',
        'photo_360.avif',
        'photo_720.avif',
        'photo_960.avif',
    ]
    await Promise.all(
        names.map((name) => fs.writeFile(path.join(imageDir, name), 'test')),
    )
    return { imageDir, names, isReferenced: async () => false }
}

test('removes unreferenced originals and all generated thumbnails', async (t) => {
    const options = await fixture(t)
    await cleanupEssayImages(['/images/photo.avif'], [], options)
    assert.deepEqual(await fs.readdir(options.imageDir), [])
    // Repeat deletion and tolerate missing originals/thumbnails.
    await cleanupEssayImages(['/images/photo.avif'], [], options)
})

test('retains files used by other content or still attached to the current record', async (t) => {
    const options = await fixture(t)
    await cleanupEssayImages(['/images/photo.avif'], [], {
        ...options,
        isReferenced: async () => true,
    })
    assert.equal((await fs.readdir(options.imageDir)).length, 4)
    await cleanupEssayImages(
        ['/images/photo.avif'],
        ['/images/photo.avif'],
        options,
    )
    assert.equal((await fs.readdir(options.imageDir)).length, 4)
})

test('checks every content collection before removing shared files', async (t) => {
    const options = await fixture(t)
    const models = [
        Essay,
        EssayDraft,
        Blog,
        BlogContent,
        ArticleDraft,
        Links,
        Comment,
    ]
    let owner
    for (const model of models) {
        t.mock.method(model, 'exists', async (query) => {
            assert.ok(
                query.$or.every((field) =>
                    Object.values(field)[0].test('/images/photo_720.avif'),
                ),
            )
            return model === owner ? { _id: 'referenced' } : null
        })
    }
    for (const model of models) {
        owner = model
        await cleanupEssayImages(['/images/photo.avif'], [], {
            imageDir: options.imageDir,
        })
        assert.equal((await fs.readdir(options.imageDir)).length, 4)
    }
    owner = null
    await cleanupEssayImages(['/images/photo.avif'], [], {
        imageDir: options.imageDir,
    })
    assert.deepEqual(await fs.readdir(options.imageDir), [])
})

test('deletes orphaned thumbnails even if the original is already absent', async (t) => {
    const options = await fixture(t)
    await fs.unlink(path.join(options.imageDir, 'photo.avif'))
    await cleanupEssayImages(['/images/photo.avif'], [], options)
    assert.deepEqual(await fs.readdir(options.imageDir), [])
})

test('ignores external URLs and rejects encoded path traversal', () => {
    assert.equal(
        getLocalEssayImageFilename('https://example.org/images/photo.avif'),
        null,
    )
    assert.equal(
        getLocalEssayImageFilename('/images/%2e%2e%2foutside.avif'),
        null,
    )
    assert.equal(
        getLocalEssayImageFilename('/images/a%5c..%5coutside.avif'),
        null,
    )
    assert.equal(getLocalEssayImageFilename('/images/%00.avif'), null)
    assert.equal(
        getLocalEssayImageFilename('/images/%E7%85%A7%E7%89%87.avif'),
        '照片.avif',
    )
})

test('detects original, encoded and thumbnail references without treating filenames as regex', () => {
    const pattern = getImageReferencePattern('photo (1).avif')
    assert.ok(pattern.test('/images/photo%20(1)_720.avif'))
    assert.ok(pattern.test('![图片](/images/photo (1).avif)'))
    assert.equal(pattern.test('/images/photo 1.avif'), false)
})

test('does not follow image subdirectories symlinked outside storage', async (t) => {
    const options = await fixture(t)
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'essay-outside-'))
    t.after(() => fs.rm(outside, { recursive: true, force: true }))
    await fs.writeFile(path.join(outside, 'private.avif'), 'keep')
    await fs.symlink(outside, path.join(options.imageDir, 'outside'))
    await cleanupEssayImages(['/images/outside/private.avif'], [], options)
    assert.equal(
        await fs.readFile(path.join(outside, 'private.avif'), 'utf8'),
        'keep',
    )
})
