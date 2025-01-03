const express = require('express')
const app = express()

const PORT = process.env.PORT ?? 3001

app.get('/', async (req, res) => {
  console.log('Service B processing request...')

  const sleepTime = req.query.sleepTime ?? 0
  await new Promise(res => setTimeout(res, sleepTime))

  const random = Math.round(Math.random() * 100)
  res.send({ number: random })
})

app.listen(PORT, () => {
  console.log(`Service B running at http://localhost:${PORT}`)
})
