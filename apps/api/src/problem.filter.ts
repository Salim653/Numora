import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{
      status: (code: number) => {
        setHeader: (name: string, value: string) => { json: (body: unknown) => void };
      };
    }>();
    const request = host.switchToHttp().getRequest<{ url: string }>();
    const status =
      error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = error instanceof HttpException ? error.getResponse() : undefined;
    const body =
      typeof details === 'object' && details !== null ? (details as Record<string, unknown>) : {};
    const message = body.detail ?? body.message;
    response
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      .json({
        type: 'about:blank',
        title:
          status === 500
            ? 'Internal Server Error'
            : error instanceof HttpException
              ? error.name
              : 'Error',
        status,
        detail:
          status === 500
            ? 'Terjadi kesalahan. Coba lagi.'
            : Array.isArray(message)
              ? message.join('; ')
              : typeof message === 'string'
                ? message
                : 'Permintaan tidak dapat diproses.',
        instance: request.url,
        ...(typeof body.code === 'string' ? { code: body.code } : {}),
      });
  }
}
