const express = require('express')
const app = express()

const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000


app.use(express.json())

// Connect to DB
connectDB()

app.get('/', (req, res) => {
    res.send('Server running')
})

// Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/posts', require('./routes/api/posts'))

app.listen(5000, () => {
    console.log(`Server running on port ${PORT}`)
})