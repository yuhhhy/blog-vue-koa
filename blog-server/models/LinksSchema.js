import mongoose from 'mongoose'

const LinksSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    site: { type: String, required: true },
    avatar: { type: String, required: true },
    category: { type: String, enum: ['friend', 'recommended'], default: 'friend' },
    sortOrder: { type: Number, default: 0, min: 0 },
})

export const Links = mongoose.model('Links', LinksSchema)
