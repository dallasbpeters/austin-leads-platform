import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'

const missingConfiguration = (name) => {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      `${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`,
    )
  }
}

const createPostHogLogProvider = () => {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  if (!projectToken) {
    missingConfiguration('NEXT_PUBLIC_POSTHOG_KEY')
    return null
  }

  const host = process.env.POSTHOG_HOST?.trim()
  if (!host) {
    missingConfiguration('POSTHOG_HOST')
    return null
  }

  return new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': 'austin-leads-platform',
      'deployment.environment': process.env.NODE_ENV || 'development',
    }),
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${host.replace(/\/$/, '')}/i/v1/logs`,
          headers: {
            Authorization: `Bearer ${projectToken}`,
            'Content-Type': 'application/json',
          },
        }),
      }),
    ],
  })
}

/* This provider is intentionally not registered globally. Only log records
 * explicitly emitted through getPostHogWorkflowLogger leave the application. */
export const posthogLogProvider = createPostHogLogProvider()

export const getPostHogWorkflowLogger = () => posthogLogProvider?.getLogger('posthog-publish-workflow')
