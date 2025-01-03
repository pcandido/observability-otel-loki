const Queue = require('bull')

const queueName = process.env.QUEUE_NAME ?? 'service-c-queue'
const redisHost = process.env.REDIS_HOST ?? 'localhost'
const redisPort = process.env.REDIS_PORT ?? 6379

const queue = new Queue(queueName, {
  redis: { host: redisHost, port: redisPort },
})

queue.process(async (job) => {
  console.log('Processing job:', job.data)

  const sleepTime = job.data.sleepTime ?? 0
  await new Promise((resolve) => setTimeout(resolve, sleepTime))

  console.log('Job completed:', job.data)
})

console.log(`Service C listening to queue ${queueName} at redis://${redisHost}:${redisPort}`)