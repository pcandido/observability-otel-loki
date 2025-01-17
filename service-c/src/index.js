const Queue = require('bull')
const logger = require('./logger')
const { metrics } = require('@opentelemetry/api')

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
  advice: {
    explicitBucketBoundaries: [0, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 25000, 50000, 75000, 100000, 250000, 500000, 750000, 1000000, +Infinity],
  }
})

queue.process(async (job) => {
  logger.info('Processing job:', job.data)

  const sleepTime = job.data.sleepTime ?? 0
  await new Promise((resolve) => setTimeout(resolve, sleepTime))

  const createdAt = new Date(job.data.createdAt)

  const freshness = new Date() - createdAt
  freshnessHistogram.record(freshness, { queue: queueName })

  logger.info('Job completed:', { ...job.data, freshness })
})

logger.info(`Service C listening to queue ${queueName} at redis://${redisHost}:${redisPort}`)