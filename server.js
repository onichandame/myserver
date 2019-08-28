const express = require('express')
const bodyParser=require('body-parser')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 8080
const cookieParser=require('cookie-parser')

app.set('views','views')
app.set('view engine','pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())

app.use(require(path.resolve(__dirname,"routes/error.js")))
let auth=require(path.resolve(__dirname,'utility/auth.js'))

app.all('/',  auth, require(path.resolve(__dirname,'core/main.js')))

app.all('/oauth', require(path.resolve(__dirname,'core/auth.js')))

app.get('/video', function(req, res) {
  const path = 'assets/sample.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(port, function () {
  console.log('Listening on port 8080!')
})
