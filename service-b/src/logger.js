const pino = require('pino')
const { trace, context } = require('@opentelemetry/api')

const baseLogger = pino({ level: 'info' })

function withTraceId(logFn) {
  return (msg, additional = {}) => {
    const span = trace.getSpan(context.active())
    const trace_id = span ? span.spanContext().traceId : 'no-trace'
    logFn({ trace_id, ...additional }, msg)
  }
}

const logger = {
  info: withTraceId(baseLogger.info.bind(baseLogger)),
  error: withTraceId(baseLogger.error.bind(baseLogger)),
}

module.exports = logger
