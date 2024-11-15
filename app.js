const express = require('express')
const http = require('http')
const route = require('./src/route/index')
const cros = require('cors')
const errorHandler = require('./src/middleware/errorHandler')

// create express app
const app = express()
app.use(cros())
app.use(express.json())
app.use('/', route)
app.use(errorHandler)

// create http server
const PORT = process.env.SEATSPACE_SERVER_PORT || 80

const server = http.createServer(app)

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

server.on('error', (error) => {
	console.error('Error starting server:', error)
})
