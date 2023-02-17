import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { performance } from 'perf_hooks';

const PERF_LOGGING_THRESHOLD = 100;

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);
  use(req: any, res: any, next: () => void) {
    const start = performance.now();

    res.on('finish', () => {
      const end = performance.now();
      if (end - start < PERF_LOGGING_THRESHOLD) {
        return;
      }
      this.logger.log(
        `perf: ${~~(end - start)}ms url: ${req.url} body: ${JSON.stringify(
          req.body,
        )}`,
      );
    });
    next();
  }
}
