const router = require('express').Router()
const theaterRouter = require('./theaterRoutes')
const showRouter = require('./showRoutes')

router.use('/theater', theaterRouter)
router.use('/show', showRouter)

module.exports = router
