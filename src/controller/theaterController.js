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
		res.status(500).json({ message: 'Error fetching nearby theaters' })
	}
}

async function getLocations(latitude, longitude) {
	latitude = parseFloat(latitude)
	longitude = parseFloat(longitude)

	// prisma can't handle the point type, so we have to use $queryRaw with raw sql
	const locations =
		await prisma.$queryRaw`SELECT t.id, t.name, t.description, t.address , t.coordinate <-> point(${latitude}, ${longitude}) AS distance , i.path as img_url FROM theater t LEFT JOIN image i ON t.id = i.object_id AND i.object_type = 'theater' ORDER BY distance limit 20;`

	return locations
}

async function getShowListByTheaterId(req, res) {
	try {
		const theaterId = parseInt(req.params.theater_id)
		const page = parseInt(req.query.page) || 1
		const pageSize = 10
		console.log('query show list by theater id:', theaterId, 'page:', page)

		const showList = await prisma.show.findMany({
			where: {
				theater_id: theaterId,
			},
			orderBy: {
				start_time: 'desc',
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
			include: {
				hall: {
					select: {
						name: true,
					},
				},
				image: {
					where: {
						object_type: 'show',
					},
					select: {
						path: true,
					},
				},
				rating: {
					where: {
						object_type: 'show',
					},
					select: {
						current_rating: true,
					},
				},
			},
		})

		const resData = showList.map((show) => {
			return {
				showId: show.id,
				showName: show.name,
				hall: show.hall.name,
				startTime: show.start_time,
				rating: show.rating.length > 0 ? show.rating[0].current_rating : 0,
				imgUrl: show.image.length > 0 ? show.image[0].path : '',
			}
		})

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Error fetching theater detail' })
	}
}

async function getTheaterBaiscInfo(req, res) {
	try {
		console.log('query theater basic info by id:', req.params.theater_id)
		const theaterId = parseInt(req.params.theater_id)

		const theater = await prisma.theater.findUnique({
			where: {
				id: theaterId,
			},
			include: {
				image: {
					where: {
						object_type: 'theater',
					},
					select: {
						path: true,
					},
				},
			},
		})

		console.log('theater:', theater)

		const resData = {
			id: theater.id,
			name: theater.name,
			description: theater.description,
			address: theater.address,
			imgUrl: theater.image[0].path || '',
		}

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Error fetching theater basic info' })
	}
}

module.exports = {
	getNearbyTheaters,
	getShowListByTheaterId,
	getTheaterBaiscInfo,
}
