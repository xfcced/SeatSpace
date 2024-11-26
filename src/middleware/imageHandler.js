const multer = require('multer')
const path = require('path')

// set up file destination and file name
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = process.env.STATIC_DIR
		cb(null, uploadPath)
	},
	filename: (req, file, cb) => {
		const timestamp = Date.now()
		const random = Math.round(Math.random() * 1e9)
		const uniqueSuffix = timestamp + '-' + random
		cb(null, 'comment-' + uniqueSuffix + path.extname(file.originalname))
	},
})

// set up file filter
const fileFilter = (req, file, cb) => {
	const allowedMimeTypes = ['image/jpeg', 'image/png']
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(new Error('Only JPG and PNG files are allowed!'), false)
	}
}

// set up upload middleware
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 5MB
	},
})

module.exports = upload
