const showController = require('../controller/showController')

const router = require('express').Router()

router.get('/recent', showController.getRecentShows)

module.exports = router
