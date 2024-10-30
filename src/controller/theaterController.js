function getNearbyTheaters(req, res) {
	console.log('get nearby theaters controller called')

	resObj = [
		{
			id: 111,
			name: 'theater name',
			imgUrl: 'http://www.google.com',
		},
		{
			id: 222,
			name: 'theater name 1',
			imgUrl: 'http://www.google.com',
		},
	]

	console.log(req.query)

	res.send(resObj)
}

module.exports = {
	getNearbyTheaters,
}
