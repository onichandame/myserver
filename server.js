const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 8080

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))

app.use(require(path.resolve(__dirname,"routes/error.js")))
const auth=require(path.resolve(__dirname,'routes/auth.js'))

app.get('/', auth.auth, function(req, res) {
  var html = fs.readFileSync('static/base.head.html')
  html += fs.readFileSync('static/main.html')
  html+=fs.readFileSync('static/base.foot.html')
  res.send(html)
})

app.get('/auth', function(req, res) {
  var html = fs.readFileSync('static/base.head.html')
  html += fs.readFileSync('static/login.html')
  html+=fs.readFileSync('static/base.foot.html')
  res.send(html)
})

app.post('/auth',auth.authenticate,auth.authorise)

app.get('/register',require(path.join(__dirname,'routes/register.js')).display)
app.post('/register',require(path.join(__dirname,'routes/register.js')).register)

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
