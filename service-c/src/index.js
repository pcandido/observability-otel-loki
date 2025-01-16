const Queue = require('bull')
const logger = require('./logger')
const { metrics } = require('@opentelemetry/api')

require('./open-telemetry')

const queueName = process.env.QUEUE_NAME ?? 'service-c-queue'
const redisHost = process.env.REDIS_HOST ?? 'localhost'
const redisPort = process.env.REDIS_PORT ?? 6379

const queue = new Queue(queueName, {
  redis: { host: redisHost, port: redisPort },
})

const meter = metrics.getMeter('default')
const freshnessHistogram = meter.createHistogram('event_freshness', {
  description: 'O tempo entre a criação e o processamento de um evento em milissegundos',
  unit: 'ms',
})

queue.process(async (job) => {
  logger.info('Processing job:', job.data)

  const sleepTime = job.data.sleepTime ?? 0
  await new Promise((resolve) => setTimeout(resolve, sleepTime))

  const number = job.data.number
  const createdAt = new Date(job.data.createdAt)

  const freshness = new Date() - createdAt
  freshnessHistogram.record(freshness, { queue: queueName, number })

  logger.info('Job completed:', job.data)
})

logger.info(`Service C listening to queue ${queueName} at redis://${redisHost}:${redisPort}`)