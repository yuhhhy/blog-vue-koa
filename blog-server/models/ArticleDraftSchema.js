import mongoose from 'mongoose'

const ArticleDraftSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: '' },
    author: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tags: { type: [String], default: [] },
    content: { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    publishing: { type: Boolean, default: false },
}, {
    timestamps: true,
})

export const ArticleDraft = mongoose.model('ArticleDraft', ArticleDraftSchema)
