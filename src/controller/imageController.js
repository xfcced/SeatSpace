const prisma = require('../service/prismaClient')

async function uploadImage(req, res) {
	try {
		if (!req.files || req.files.length === 0) throw new Error('No file uploaded')
		console.log('files:', req.files)

		const newFilesDataTransactions = req.files.map((file) => {
			const staticHostPath = `http://static.seatspace.icu/${file.filename}`

			return prisma.image.create({
				data: {
					object_type: 'seat',
					name: file.filename,
					path: staticHostPath,
				},
			})
		})

		const images = await prisma.$transaction(newFilesDataTransactions)

		const resData = images.map((image) => {
			return {
				status: 'success',
				imgId: image.id,
				imgUrl: image.path,
			}
		})

		res.send(resData)
	} catch (error) {
		console.error(error.message)
		res.status(500).send({ message: error.message || 'Error uploading image' })
	}
}

module.exports = {
	uploadImage,
}
