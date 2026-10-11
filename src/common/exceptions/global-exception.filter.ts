import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from './app.exception';
import { ErrorCode } from './error-code.enum';
import { mapPrismaError } from './prsima-exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let code: string;
    let message: string;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.getHttpErrorCode(status);
      message =
        status >= 500
          ? 'Internal server error'
          : this.getHttpErrorMessage(exception);
    } else {
      const prismaException = mapPrismaError(exception);

      if (prismaException) {
        status = prismaException.getStatus();
        code = prismaException.code;
        message = prismaException.message;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = ErrorCode.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getHttpErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      default:
        return status >= 500 ? ErrorCode.INTERNAL_SERVER_ERROR : 'HTTP_ERROR';
    }
  }

  private getHttpErrorMessage(exception: HttpException): string {
    const status = exception.getStatus();

    if (status === HttpStatus.NOT_FOUND) {
      return 'Resource not found';
    }

    const exceptionResponse = exception.getResponse();

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;

      if (typeof message === 'string') {
        return message;
      }

      if (
        Array.isArray(message) &&
        message.every((item) => typeof item === 'string')
      ) {
        return message.join(', ');
      }
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    return exception.message;
  }
}
