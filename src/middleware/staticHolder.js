const express = require('express')

function staticHolder(req, res, next) {
	const hostname = req.hostname
	if (hostname === 'seatspace.icu') {
		express.static(process.env.DIST_DIR)(req, res, next)
	} else if (hostname === 'static.seatspace.icu') {
		express.static(process.env.STATIC_DIR)(req, res, next)
	} else {
		next()
	}
}

module.exports = staticHolder
