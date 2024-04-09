import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { trace, Tracer } from '@opentelemetry/api'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { ApiRes } from '../types/type.global'
import { Context } from 'elysia'

export function initializeTracing(serviceName: string): Tracer {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  })

  const consoleExporter = new ConsoleSpanExporter()
  const jaegerExporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  })

  provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter))
  provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter))

  provider.register()

  return trace.getTracer(serviceName)
}

export const tracer = initializeTracing('bun-api')

export function tracerFn<T>(ctx: Context, apiLogic: () => Promise<T>) {
  return tracer.startActiveSpan(`${ctx.request.method} ${ctx.path}`, async (requestSpan) => {
    try {
      const data = (await apiLogic()) as ApiRes
      requestSpan.setAttribute('http.status', 200)
      requestSpan.setAttribute('http.bun.api', JSON.stringify(ctx))
      return data
    } catch (e) {
      requestSpan.setAttribute('http.status', 400)
      requestSpan.setAttribute('http.bun.api', JSON.stringify(ctx))
      return ctx.error(400, e)
    } finally {
      requestSpan.end()
    }
  })
}
