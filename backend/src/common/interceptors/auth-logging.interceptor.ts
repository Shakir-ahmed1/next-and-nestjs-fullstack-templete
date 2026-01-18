import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('AuthActivity');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const url = request.url;

        // Only log auth routes
        if (!url.includes('/api/auth')) {
            return next.handle();
        }

        const method = request.method;
        const body = request.body;
        const userEmail = body?.email || 'unknown';

        if (url.includes('/sign-in') || url.includes('/sign-up')) {
            this.logger.log(`Auth attempt: [${method}] ${url} for user: ${userEmail}`);
        }

        return next.handle().pipe(
            tap({
                next: (data) => {
                    if (url.includes('/sign-in') || url.includes('/sign-up')) {
                        this.logger.log(`Auth success: [${method}] ${url} for user: ${userEmail}`);
                    }
                },
                error: (err) => {
                    if (url.includes('/sign-in') || url.includes('/sign-up')) {
                        this.logger.error(`Auth failure: [${method}] ${url} for user: ${userEmail} - Error: ${err.message}`);
                    }
                },
            }),
        );
    }
}
