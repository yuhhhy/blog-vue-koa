import mongoose from 'mongoose'

const EssayDraftSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    sourceEssayId: { type: String, default: '' },
    title: { type: String, default: '', maxlength: 120 },
    content: { type: String, default: '' },
    version: { type: Number, default: 1 },
}, {
    timestamps: true,
})

export const EssayDraft = mongoose.model('EssayDraft', EssayDraftSchema)
