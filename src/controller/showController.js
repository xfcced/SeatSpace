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
		res.json('error fetching recent shows')
	}
}

function getSeatLayout(req, res) {
	res.json('get seat layout')
}

function getShowDetail(req, res) {
	res.json('get show comments')
}

module.exports = {
	getRecentShows,
	getSeatLayout,
	getShowDetail,
}
