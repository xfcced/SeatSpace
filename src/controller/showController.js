const prisma = require('../service/prismaClient')

async function getRecentShows(req, res) {
	try {
		const page = req.query.page || 1
		const pageSize = 10
		const time = new Date()
		time.setHours(0, 0, 0, 0)
		time.setDate(time.getDate() + 1)

		const shows = await prisma.show.findMany({
			take: pageSize,
			skip: (page - 1) * pageSize,
			orderBy: { start_time: 'desc' },
			select: {
				id: true,
				name: true,
				theater_id: true,
				theater: {
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
			},
			where: {
				start_time: {
					lt: time,
				},
			},
		})

		const resData = shows.map((show) => {
			return {
				id: show.id,
				name: show.name,
				theater: show.theater.name,
				theaterId: show.theater_id,
				imgUrl: show.image.length > 0 ? show.image[0].path : '',
			}
		})

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'error fetching recent shows' })
	}
}

async function getSeatLayout(req, res) {
	try {
		const showId = parseInt(req.params.showId)
		console.log('Get Seat Layout Called with show id: ', showId)

		// find hall id of the show
		const showInfo = await prisma.show.findUnique({
			where: {
				id: showId,
			},
			select: {
				hall_id: true,
			},
		})
		const hallId = showInfo.hall_id
		console.log('Hall Id: ', hallId)

		// find all seats and zones of this hall
		const seatsQuery = prisma.seat.findMany({
			where: {
				hall_id: hallId,
			},
			select: {
				id: true,
				row_no: true,
				seat_no: true,
				zone_id: true,
				rating: {
					select: {
						current_rating: true,
					},
				},
			},
		})

		const zonesQuery = prisma.zone.findMany({
			where: {
				hall_id: hallId,
			},
			select: {
				id: true,
				zone_offset_x: true,
				zone_offset_y: true,
				rotation: true,
			},
		})

		// query for seats and zones in parallel
		const [seats, zones] = await Promise.all([seatsQuery, zonesQuery])

		// create a hash map for zones by id
		const zoneMap = {}
		zones.forEach((zone) => {
			zoneMap[zone.id] = {
				zoneId: zone.id,
				zoneOffsetX: zone.zone_offset_x,
				zoneOffsetY: zone.zone_offset_y,
				rotation: zone.rotation,
				seats: [],
			}
		})

		// assign each seat to its zone
		seats.forEach((seat) => {
			const zoneId = seat.zone_id
			if (zoneMap[zoneId]) {
				zoneMap[zoneId].seats.push([seat.id, seat.rating.length > 0 ? seat.rating[0].current_rating : 0, seat.row_no, seat.seat_no])
			} else {
				console.warn(`Zone with id ${zoneId} not found.`)
			}
		})

		res.json(Object.values(zoneMap))
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'error fetching seat layout' })
	}
}

async function getShowComments(req, res) {
	try {
		const showId = parseInt(req.params.showId)
		console.log('Get Show Detail Called with show id: ', showId)

		// find all comments of this show
		const comments = await prisma.comment.findMany({
			where: {
				show_id: showId,
			},
			select: {
				id: true,
				content: true,
				rating_show: true,
				create_time: true,
				comment_image: {
					select: {
						image: {
							where: {
								object_type: 'seat',
							},
							select: {
								path: true,
							},
						},
					},
					orderBy: {
						sequence: 'asc',
					},
				},
			},
		})

		// format the response data
		const resData = []
		comments.forEach((comment) => {
			const resItem = {
				id: comment.id,
				comment: comment.content,
				rating: comment.rating_show,
				date: comment.create_time,
				imgUrl: comment.comment_image.map((img) => img.image.path),
			}

			resData.push(resItem)
		})

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'error fetching show detail' })
	}
}

async function getShowBasicInfo(req, res) {
	try {
		const showId = parseInt(req.params.showId)
		console.log('Get Show Basic Info Called with show id: ', showId)

		const showInfo = await prisma.show.findUnique({
			where: {
				id: showId,
			},
			select: {
				id: true,
				name: true,
				hall: {
					select: {
						name: true,
					},
				},
				theater: {
					select: {
						name: true,
					},
				},
				start_time: true,
				rating: {
					select: {
						current_rating: true,
					},
				},
				image: {
					where: {
						object_type: 'show',
					},
					select: {
						id: true,
						path: true,
					},
				},
			},
		})

		const resData = {
			showId: showInfo.id,
			showName: showInfo.name,
			hall: showInfo.hall.name,
			theater: showInfo.theater.name,
			startTime: showInfo.start_time,
			rating: showInfo.rating.length > 0 ? showInfo.rating[0].current_rating : 0,
			imgUrl: showInfo.image.length > 0 ? showInfo.image[0].path : '',
		}

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'error fetching show basic info' })
	}
}

module.exports = {
	getRecentShows,
	getSeatLayout,
	getShowComments,
	getShowBasicInfo,
}
