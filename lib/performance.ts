import { logger } from './logger';

export function reportWebVitals(metric: {
  id: string;
  name: string;
  startTime: number;
  value: number;
  label: string;
}) {
  logger.info({
    type: 'web_vital',
    name: metric.name,
    value: metric.value,
    label: metric.label,
    id: metric.id,
  }, `Web Vital: ${metric.name}`);
}

export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    logger.info({
      type: 'performance',
      name,
      durationMs: Math.round(duration),
    }, `Performance: ${name} took ${Math.round(duration)}ms`);
  });
}
