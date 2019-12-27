express = require('express')
bodyparser = require('body-parser')

app= express()
app.use(bodyparser.urlencoded({'extended': true}))
app.use(bodyparser.json());

app.all('/', (req, res) => {
    console.log(['req', req.method, req.params, req.query, req.body])

    res.send('ok\n')

})

const port = process.argv[2]
app.listen(port, () => {
    console.log('listen at', port)
})