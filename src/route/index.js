const router = require('express').Router()
const showController = require('../controller/showController')
const theaterController = require('../controller/theaterController')
const searchController = require('../controller/searchController')
const seatController = require('../controller/seatController')
const commentController = require('../controller/commentController')
const imageHandler = require('../middleware/imageHandler')

// show routes
router.get('/show/recent', showController.getRecentShows)
router.get('/show/layout/:showId', showController.getSeatLayout)
router.get('/show/comment/:showId', showController.getShowComments)
router.get('/show/basic/:showId', showController.getShowBasicInfo)

// theater routes
router.get('/theater/nearby', theaterController.getNearbyTheaters)
router.get('/theater/shows/:theater_id', theaterController.getShowListByTheaterId)
router.get('/theater/basic/:theater_id', theaterController.getTheaterBaiscInfo)

// search routes
router.get('/search', searchController.search)

// seat routes
router.get('/seat/:seatId', seatController.getSeatComments)

// comment routes
router.post('/comment/new', imageHandler.array('images', 5), commentController.createComment)

module.exports = router
