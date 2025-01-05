const express = require('express')
const logger = require('./logger')

const app = express()

require('./open-telemetry')

const PORT = process.env.PORT ?? 3001

app.get('/', async (req, res) => {
  logger.info('Service B processing request')

  const sleepTime = req.query.sleepTime ?? 0
  await new Promise(res => setTimeout(res, sleepTime))

  const random = Math.round(Math.random() * 100)
  res.send({ number: random })
})

app.listen(PORT, () => {
  logger.info(`Service B running at http://localhost:${PORT}`)
})
