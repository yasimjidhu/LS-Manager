import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            // Handle cases where exceptionResponse is string or object
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || message;
                error = responseObj.error || error;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma Errors
            // P2002: Unique constraint failed
            // P2025: Record not found
            if (exception.code === 'P2002') {
                status = HttpStatus.CONFLICT;
                message = 'Unique constraint failed';
                error = 'Conflict';
            } else if (exception.code === 'P2025') {
                status = HttpStatus.NOT_FOUND;
                message = 'Record not found';
                error = 'Not Found';
            } else {
                status = HttpStatus.BAD_REQUEST;
                message = `Database Error: ${exception.message}`;
                error = 'Database Error';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: error,
            message: message,
            // Only include stack trace in development
            ...(process.env.NODE_ENV !== 'production' && { stack: (exception as any).stack }),
        };

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `🔥 ${request.method} ${request.url}`,
                (exception as any).stack,
                'GlobalExceptionFilter',
            );
        } else {
            this.logger.warn(
                `⚠️ ${request.method} ${request.url} - ${status} - ${message}`
            );
        }

        response.status(status).json(errorResponse);
    }
}
