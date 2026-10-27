import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog')
        console.log('MongoDB connected')
        return true
    } catch (err) {
        console.error(err)
        return false
    }
}
