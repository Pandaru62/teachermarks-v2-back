import { HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { AppException } from './app.exception';
import { ErrorCode } from './error-code.enum';

export function mapPrismaError(error: unknown): AppException | null {
  if (!(error instanceof PrismaClientKnownRequestError)) {
    return null;
  }

  switch (error.code) {
    case 'P2002':
      // Reprends ici le mapping P2002 de ton utilitaire existant.
      return new AppException(
        ErrorCode.DUPLICATE_RECORD,
        'A record with these values already exists',
        HttpStatus.CONFLICT,
      );

    case 'P2003':
      // Reprends ici le mapping P2003 de ton utilitaire existant.
      return new AppException(
        ErrorCode.VALIDATION_ERROR,
        'A related record does not exist',
        HttpStatus.BAD_REQUEST,
      );

    case 'P2025':
      return new AppException(
        ErrorCode.VALIDATION_ERROR,
        'The requested record was not found',
        HttpStatus.NOT_FOUND,
      );

    default:
      return null;
  }
}

export function handlePrismaError(error: unknown): never {
  const mappedError = mapPrismaError(error);

  if (mappedError) {
    throw mappedError;
  }

  throw error;
}
