import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    public readonly errorMessage: string,
    status: HttpStatus,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      {
        code,
        message: errorMessage,
        details,
      },
      status,
    );
  }
}
