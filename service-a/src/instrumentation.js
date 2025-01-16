import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'

const otlpEndpoint = process.env.OTEL_COLLECTOR_URL || 'http://otel-collector:4318'

const traceExporter = new OTLPTraceExporter({
  url: `${otlpEndpoint}/v1/traces`,
})

const metricExporter = new OTLPMetricExporter({
  url: `${otlpEndpoint}/v1/metrics`,
})

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000,
})

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  metricReader,
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
