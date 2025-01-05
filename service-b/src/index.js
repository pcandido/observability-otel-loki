const express = require('express')
const logger = require('./logger')
const { trace } = require('@opentelemetry/api')

const app = express()

require('./open-telemetry')

const PORT = process.env.PORT ?? 3001

app.get('/', async (req, res) => {
  logger.info('Service B processing request')

  const sleep1 = Math.random() * 0.4
  const sleep2 = Math.random() * 0.4
  const sleep3 = 1 - sleep1 - sleep2
  const sleepTime = req.query.sleepTime ?? 0

  await sleep(sleepTime * sleep1)
  const random = await generateNumber(sleepTime * sleep2)
  await sleep(sleepTime * sleep3)

  res.send({ number: random })
})

async function generateNumber(sleepTime) {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('generateNumber', { attributes: { 'custom.sleepTime': sleepTime } })

  try {
    span.addEvent('start sleep')
    await sleep(sleepTime)
    span.addEvent('end sleep')

    const random = Math.round(Math.random() * 100)
    span.setAttribute('generated.number', random)
    span.addEvent('number generated')
    return random
  } catch (error) {
    span.recordException(error)
    throw error
  } finally {
    span.end()
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.listen(PORT, () => {
  logger.info(`Service B running at http://localhost:${PORT}`)
})
