import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const details =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const message = details.detail ?? details.message;
    const detail =
      exception instanceof HttpException
        ? Array.isArray(message)
          ? message.join('; ')
          : typeof message === 'string'
            ? message
            : exception.message
        : 'An unexpected error occurred.';
    const request = host.switchToHttp().getRequest<{ url: string }>();
    const response = host.switchToHttp().getResponse<{
      status(code: number): { type(value: string): { json(value: unknown): void } };
    }>();
    response
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: STATUS_CODES[status] ?? 'Error',
        status,
        detail,
        instance: request.url,
        ...(typeof details.code === 'string' ? { code: details.code } : {}),
      });
  }
}
