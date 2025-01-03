const express = require('express')
const axios = require('axios')
const Queue = require('bull')

require('./open-telemetry')

const app = express()

const PORT = process.env.PORT ?? 3000
const serviceBUrl = process.env.SERVICE_B_URL ?? 'http://localhost:3001'
const redisHost = process.env.REDIS_HOST ?? 'localhost'
const redisPort = process.env.REDIS_PORT ?? 6379
const queueName = process.env.QUEUE_NAME ?? 'service-c-queue'

const serviceCQueue = new Queue(queueName, {
  redis: { host: redisHost, port: redisPort },
})

app.get('/', async (req, res) => {
  try {
    console.log('Service A processing request...')

    const serviceASleepTime = parseInt(req.query.service_a_sleep_time) || 0
    const serviceBSleepTime = parseInt(req.query.service_b_sleep_time) || 0
    const serviceCSleepTime = parseInt(req.query.service_c_sleep_time) || 0

    if (serviceASleepTime > 0) {
      await new Promise(res => setTimeout(res, serviceASleepTime))
    }

    console.log('Calling Service B...')
    const responseB = await axios.get(serviceBUrl, {
      params: { sleepTime: serviceBSleepTime },
    })
    console.log('Response from Service B:', responseB.data)

    console.log('Adding job to Service C queue...')
    await serviceCQueue.add({ number: responseB.data.number, sleepTime: serviceCSleepTime })

    res.send({ message: 'Service A completed request' })
  } catch (error) {
    console.error('Error in Service A:', error)
    res.status(500).send({ error: 'Something went wrong' })
  }
})

app.listen(PORT, () => {
  console.log(`Service A running at http://localhost:${PORT}`)
})
