import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
});

// Helper functions for common log patterns
export function logApiRequest(req: Request, context?: Record<string, unknown>) {
  logger.info({
    type: 'api_request',
    method: req.method,
    url: req.url,
    ...context,
  }, 'API request received');
}

export function logApiResponse(
  req: Request,
  statusCode: number,
  durationMs: number,
  context?: Record<string, unknown>
) {
  logger.info({
    type: 'api_response',
    method: req.method,
    url: req.url,
    statusCode,
    durationMs,
    ...context,
  }, 'API response sent');
}

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    type: 'error',
    error: error.message,
    stack: error.stack,
    ...context,
  }, error.message);
}

export function logCronJob(status: 'started' | 'completed' | 'failed', context?: Record<string, unknown>) {
  logger.info({
    type: 'cron_job',
    status,
    ...context,
  }, `Cron job ${status}`);
}
