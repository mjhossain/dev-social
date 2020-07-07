const mongoose = require('mongoose')
const config = require('config')

const dbURL = config.get('mongoURI')

const connectDB = async() => {
    try {
        await mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        console.log('Database Connected')
    } catch (err) {
        console.error(err.message)
            // Exit App
        process.exit(1)
    }
}

module.exports = connectDB