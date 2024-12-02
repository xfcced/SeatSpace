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
	const filetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
	if (filetypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		console.log('fileFilter error: ', file.mimetype)
		cb(new Error('Only images are allowed!'), false)
	}
}

// set up upload middleware
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
})

module.exports = upload
