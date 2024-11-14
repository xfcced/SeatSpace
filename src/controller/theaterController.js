const prisma = require('../service/prismaClient')

async function getNearbyTheaters(req, res) {
	try {
		const { latitude, longitude } = req.query
		const locations = await getLocations(latitude, longitude)

		const resData = locations.map((location) => {
			return {
				id: location.id,
				name: location.name,
				imgUrl: location.img_url,
				description: location.description,
			}
		})

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.send('Error fetching nearby theaters')
	}
}

async function getLocations(latitude, longitude) {
	latitude = parseFloat(latitude)
	longitude = parseFloat(longitude)

	const locations =
		await prisma.$queryRaw`SELECT t.id, t.name, t.description, t.address , t.coordinate <-> point(${latitude}, ${longitude}) AS distance , i.path as img_url FROM theater t LEFT JOIN image i ON t.id = i.object_id AND i.object_type = 'theater' ORDER BY distance;`

	return locations
}

function getTheaterDetailById(req, res) {
	res.json('get theater detail by id')
}

module.exports = {
	getNearbyTheaters,
	getTheaterDetailById,
}
