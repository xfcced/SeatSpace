const router = require('express').Router()
const showController = require('../controller/showController')
const theaterController = require('../controller/theaterController')
const searchController = require('../controller/searchController')
const seatController = require('../controller/seatController')
const imageController = require('../controller/imageController')
const commentController = require('../controller/commentController')

// show routes
router.get('/show/recent', showController.getRecentShows)
router.get('/show/seat/:showId', showController.getSeatLayout)
router.get('/show/detail/:showId', showController.getShowDetail)

// theater routes
router.get('/theater/nearby', theaterController.getNearbyTheaters)
router.get('/theater/:theater_id', theaterController.getTheaterDetailById)

// search routes
router.get('/search', searchController.search)

// seat routes
router.get('/seat/:seatId', seatController.getSeatComments)

// image routes
router.post('/image/new', imageController.uploadImage)

// comment routes
router.post('/comment/new', commentController.createComment)

module.exports = router
