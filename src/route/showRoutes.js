const router = require('express').Router()

router.get('/getRecommendedShows', (req, res) => {
	console.log('get recommended shows route called')
	res.send('get recommended shows route called')
})

module.exports = router
