import mongoose from 'mongoose'

const EssaySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    solarLocation: {
        type: new mongoose.Schema({
            latitude: { type: Number, required: true, min: -90, max: 90 },
            longitude: { type: Number, required: true, min: -180, max: 180 },
            region: { type: String, default: '' },
        }, { _id: false }),
        required: false,
    },
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
})

export const Essay = mongoose.model('Essay', EssaySchema)
