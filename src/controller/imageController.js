const prisma = require('../service/prismaClient')

async function uploadImage(req, res) {
	try {
		if (!req.file) throw new Error('No file uploaded')

		const staticHostPath = `http://static.seatspace.icu/${req.file.filename}`
		// save image data to database
		const newDBImage = await prisma.image.create({
			data: {
				object_type: 'seat',
				name: req.file.filename,
				path: staticHostPath,
			},
		})

		// build response data
		const resData = {
			status: 'success',
			imgId: newDBImage.id,
			imgUrl: staticHostPath,
		}

		res.send(resData)
	} catch (error) {
		console.error(error.message)
		res.status(500).send({ message: 'Error uploading image' })
	}
}

module.exports = {
	uploadImage,
}
