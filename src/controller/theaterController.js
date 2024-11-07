const prisma = require('../service/prismaClient')

async function getNearbyTheaters(req, res) {
	try {
		console.log('get nearby theaters controller called')
		const { latitude, longitude } = req.query
		const locations = await getLocations(latitude, longitude)
		res.json(locations)
	} catch (error) {
		console.log(error)
		res.send('Error fetching nearby theaters')
	}
}

async function getLocations(latitude, longitude) {
	latitude = parseFloat(latitude)
	longitude = parseFloat(longitude)

	const locations =
		await prisma.$queryRaw`SELECT t.name, t.description, t.address , t.coordinate <-> point(${latitude}, ${longitude}) AS distance , i.path FROM theater t LEFT JOIN image i ON t.id = i.object_id AND i.object_type = 'theater' ORDER BY distance;`

	return locations
}

module.exports = {
	getNearbyTheaters,
}
