import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly logger: Logger) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: (exception as Error).message || 'Internal server error' };

        this.logger.error({
            err: exception,
            url: request.url,
            method: request.method,
            status,
        }, 'Unhandled exception');

        response.status(status).json(
            exception instanceof HttpException
                ? message
                : {
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: 'Internal server error',
                },
        );
    }
}
