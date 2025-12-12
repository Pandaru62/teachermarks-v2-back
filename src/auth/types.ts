import { UserRoleEnum } from 'prisma/generated/browser';
import { Request } from "express";

export interface IPayloadType {
  sub: number;
  role: UserRoleEnum;
}

export interface IRequestWithUser extends Request {
  user: IPayloadType;
}

export interface IRequestWithRefreshToken extends IRequestWithUser {
  refreshToken: string;
}

export interface IRequestWithResetPassword extends IRequestWithUser {
  resetPasswordToken: string;
}

export interface IRequestWithVerifyEmail extends IRequestWithUser {
  verifyEmailToken: string;
}
