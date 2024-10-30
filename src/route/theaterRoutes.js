const router = require('express').Router()
const theaterController = require('../controller/theaterController')

router.get('/nearby', theaterController.getNearbyTheaters)

module.exports = router
