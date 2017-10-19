var fetch = require('node-fetch')
var cheerio = require('cheerio')
var path = require('path')
var fs = require('fs')

var argv = process.argv
var url = argv[2]
var selector = argv[3]
var folderName = argv[4] || Math.random().toString(36).substr(2, 8)
var directory = `imgs/${folderName}`
fs.mkdirSync(directory)

function parseImgs(content) {
	var $ = cheerio.load(content)
	var imgs = []
	$(selector).each(function(index, img) {
		var src = $(img).attr('src')
		if (src.indexOf('//') === 0) src = 'http:' + src
		imgs.push(src)
	})
	return imgs
}

async function saveImg(img) {
	var basename = path.basename(img)
	var filePath = path.join(directory, basename)
	console.time(basename)
	var res = await fetch(img)
	var writeStream = fs.createWriteStream(filePath)
	writeStream.on('finish', console.timeEnd.bind(console, basename))
	res.body.pipe(writeStream)
}

async function fetchImgs(url) {
	var res = await fetch(url)
	var content = await res.text()
	var imgs = parseImgs(content)
	imgs.forEach(saveImg)
}

fetchImgs(url)
.catch(error => console.error(error))