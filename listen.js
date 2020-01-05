#!/usr/bin/env node

express = require('express')
bodyparser = require('body-parser')
path = require('path')
fs = require('fs')
const testData = require('./data/testData')

app= express()
app.use(bodyparser.urlencoded({'extended': true}))
app.use(bodyparser.json());

app.use((req, res, next) => {
    console.log(['req', req.method, req.path, req.params, req.query, req.body])
    next()
})

app.all('/', (req, res) => {
    res.send('ok\n')
})

const m2m_rt = testData.testM2MReturn
app.post('/auth/token',(req,res) => {
  const body = req.body
  if(body.client_secret){
    return res.send(m2m_rt)
  }

})

app.get('/download', (req, res) =>{
  const fileName = path.join(__dirname, './nock.js')
  const file = fs.readFileSync(fileName)
  // res.attachment(fileName)
  // res.send(file)
  res.download(fileName)
})

app.all('*', (req, res) => {
	console.log('other route')
	res.send('ok\n')
})


const port = process.argv[2]
app.listen(port, () => {
    console.log('listen at', port)
})
