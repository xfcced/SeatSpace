const prisma = require('../service/prismaClient')
const fs = require('fs').promises

async function createComment(req, res) {
	try {
		// parse request data
		const commentData = req.body
		commentData.showId = parseInt(commentData.showId)
		commentData.seatId = parseInt(commentData.seatId)
		commentData.showRating = parseFloat(commentData.showRating)
		commentData.seatRating = parseFloat(commentData.seatRating)

		console.log('create comment with showId: ', commentData.showId, ' and seatId: ', commentData.seatId)

		// check if show and seat exist
		const showDataQuery = prisma.show.findUnique({
			where: {
				id: commentData.showId,
			},
		})
		const seatDataQuery = prisma.seat.findUnique({
			where: {
				id: commentData.seatId,
			},
		})
		const result = await Promise.all([showDataQuery, seatDataQuery])
		if (!result[0] || !result[1]) throw new Error('Image or show not found')

		// build image list data
		const imgList = buildImgList(req.files)

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
		// 2. create comment and link images
		const createComment = prisma.comment.create({
			data: {
				show_id: commentData.showId,
				seat_id: commentData.seatId,
				content: commentData.content,
				rating_seat: commentData.seatRating,
				rating_show: commentData.showRating,
				comment_image: {
					create: imgList.map((img) => {
						return {
							image: {
								create: {
									object_id: commentData.seatId,
									object_type: 'seat',
									name: img.name,
									path: img.path,
									origin_name: img.originName,
								},
							},
							sequence: img.sequence,
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
		const data = await prisma.$transaction([createComment, updateShowRating, updateSeatRating])

		const resData = {
			status: 'success',
			commentId: data[1].id,
		}
		res.json(resData)
	} catch (error) {
		console.error(error)

		// delete uploaded images
		req.files.forEach((file) => {
			fs.unlink(file.path).then((res) => {
				console.log('delete file:', file.originalname)
			})
		})

		res.status(500).json({ message: error.message || 'Internal Server Error when create comment' })
	}
}

function buildImgList(files) {
	return (
		files.map((file, index) => {
			const staticHostPath = `http://static.seatspace.icu/${file.filename}`

			return {
				sequence: index,
				object_type: 'seat',
				name: file.filename,
				path: staticHostPath,
				originName: file.originalname,
			}
		}) || []
	)
}

module.exports = {
	createComment,
}
