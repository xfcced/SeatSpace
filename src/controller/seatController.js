const prisma = require('../service/prismaClient')

async function getSeatComments(req, res) {
	try {
		const seatId = parseInt(req.params.seatId)
		console.log('Get Seat Comments Called with seat id: ', seatId)

		const page = req.query.page || 1
		const pageSize = 10

		const comments = await prisma.comment.findMany({
			where: {
				seat_id: seatId,
			},
			take: pageSize,
			skip: (page - 1) * pageSize,
			select: {
				// id: true,
				rating_seat: true,
				comment_image: {
					where: {
						sequence: 0,
					},
					select: {
						image: {
							where: {
								object_type: 'seat',
							},
							select: {
								// id: true,
								path: true,
							},
						},
					},
				},
			},
		})

		const resData = {
			seatId: seatId,
			comments: [],
		}

		comments.forEach((comment) => {
			if (!comment.comment_image || comment.comment_image.length === 0) return

			const item = {
				imgUrl: comment.comment_image[0].image.path,
				rating: comment.rating_seat,
			}

			resData.comments.push(item)
		})

		res.json(resData)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'error fetching seat comments' })
	}
}

module.exports = {
	getSeatComments,
}
