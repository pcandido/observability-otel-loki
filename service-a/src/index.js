const express = require('express')
const axios = require('axios')
const Queue = require('bull')
const logger = require('./logger')

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
    const serviceASleepTime = parseInt(req.query.service_a_sleep_time) || 0
    const serviceBSleepTime = parseInt(req.query.service_b_sleep_time) || 0
    const serviceCSleepTime = parseInt(req.query.service_c_sleep_time) || 0

    logger.info('Service A processing request...', {serviceASleepTime, serviceBSleepTime, serviceCSleepTime})

    if (serviceASleepTime > 0) {
      await new Promise(res => setTimeout(res, serviceASleepTime))
    }

    logger.info('Calling Service B...')
    const responseB = await axios.get(serviceBUrl, {
      params: { sleepTime: serviceBSleepTime },
    })
    logger.info('Response from Service B:', responseB.data)

    logger.info('Adding job to Service C queue', { number: responseB.data.number })
    await serviceCQueue.add({ number: responseB.data.number, sleepTime: serviceCSleepTime, createdAt: new Date().getTime() })

    res.send({ message: 'Service A completed request' })
  } catch (error) {
    logger.error('Error in Service A:', error)
    res.status(500).send({ error: 'Something went wrong' })
  }
})

app.listen(PORT, () => {
  logger.info(`Service A running at http://localhost:${PORT}`)
})
