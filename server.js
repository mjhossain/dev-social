const express = require('express')
const app = express()

const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

// Connect to DB
connectDB()

app.get('/', (req, res) => {
    res.send('Server running')
})

app.listen(5000, () => {
    console.log(`Server running on port ${PORT}`)
})