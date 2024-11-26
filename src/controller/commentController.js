const prisma = require('../service/prismaClient')

async function createComment(req, res) {
	try {
		const commentData = req.body
		console.log('create comment with showId: ', commentData.showId, ' and seatId: ', commentData.seatId)

		// check if the images and show exist
		const imageDataQuery = prisma.image.findMany({
			where: {
				id: {
					in: commentData.imgIds,
				},
			},
		})
		const showDataQuery = prisma.show.findUnique({
			where: {
				id: commentData.showId,
			},
		})
		const [findImagedata, findShowData] = await Promise.all([imageDataQuery, showDataQuery])
		if (findImagedata.length !== commentData.imgIds.length || !findShowData) throw new Error('Image or show not found')

		// get current rating
		const currentRating = await prisma.rating.findMany({
			where: {
				object_id: {
					in: [commentData.showId, commentData.seatId],
				},
				object_type: {
					in: ['show', 'seat'],
				},
			},
		})
		const ratingHash = {}
		currentRating.forEach((rating) => {
			ratingHash[rating.object_type] = rating
		})

		// create comment transaction
		// 1. update image object_id
		const updateImagedata = prisma.image.updateMany({
			where: {
				id: {
					in: commentData.imgIds,
				},
			},
			data: {
				object_id: commentData.seatId,
			},
		})

		// 2. create comment and link images
		const createComment = prisma.comment.create({
			data: {
				show_id: commentData.showId,
				seat_id: commentData.seatId,
				content: commentData.content,
				rating_seat: commentData.seatRating,
				rating_show: commentData.showRating,
				comment_image: {
					create: commentData.imgIds.map((imgId, index) => {
						return {
							image_id: imgId,
							sequence: index,
						}
					}),
				},
			},
		})

		// 3. update show rating
		const updateShowRating = prisma.rating.update({
			where: {
				id: ratingHash.show.id,
			},
			data: {
				rating_count: ratingHash.show.rating_count + 1,
				rating_sum: ratingHash.show.rating_sum + commentData.showRating,
				current_rating: (ratingHash.show.rating_sum + commentData.showRating) / (ratingHash.show.rating_count + 1),
			},
		})

		// 4. update seat rating
		const updateSeatRating = prisma.rating.update({
			where: {
				id: ratingHash.seat.id,
			},
			data: {
				rating_count: ratingHash.seat.rating_count + 1,
				rating_sum: ratingHash.seat.rating_sum + commentData.seatRating,
				current_rating: (ratingHash.seat.rating_sum + commentData.seatRating) / (ratingHash.seat.rating_count + 1),
			},
		})

		// execute transaction
		const data = await prisma.$transaction([updateImagedata, createComment, updateShowRating, updateSeatRating])

		const resData = {
			status: 'success',
			commentId: data[1].id,
		}
		res.json(resData)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal Server Error when create comment' })
	}
}

module.exports = {
	createComment,
}
