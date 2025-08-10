import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IPayloadType, IRequestWithRefreshToken } from './types';
import { TypeTokenEnum } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { Request, Response } from 'express';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}


  // sign in -- Connexion
  @HttpCode(HttpStatus.OK)
  @Post("signin")
  async signin(
  @Body() body: SignInDto,
  @Res({passthrough: true}) response : Response
  ) {
    // check user email
    const userFound =  await this.userService.findByEmail(body.email);
    if (!userFound) throw new UnauthorizedException("Bad Credentials");

    // check user is validated
    if (!userFound.is_validated) {
      throw new ConflictException("Please verify your email before signing in",);
    }

    // check password
    const compare = await argon2.verify(userFound.password, body.password);
    if (!compare) throw new UnauthorizedException("Bad Credentials");

    // create payload
    const payload: IPayloadType = {
      sub: userFound.id,
      role: userFound.role
    }

    // generate access token
    const access_token = await this.authService.createJwt(payload, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);

    // generate refresh token
    const refresh_token = await this.authService.createJwt(payload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

    // create or update refresh token
    await this.authService.upsertToken(userFound.id, await argon2.hash(refresh_token), TypeTokenEnum.REFRESH_TOKEN)

    // Set refresh token in secure cookie
    response.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

    return {
      access_token,
      user: {
        email: userFound.email,
        firstname: userFound.profile.firstname,
        lastname: userFound.profile.lastname,
        school: userFound.profile.school,
        id: userFound.id,
        is_first_visit: userFound.is_first_visit,
        current_trimester: userFound.current_trimester
      }
    }
  }

  // sign up -- Inscription
  @Post("signup")
  async signup(
  @Body() body: CreateUserDto
  ) {
    console.log("🚀 ~ AuthController ~ body:", body)
    // check user email doesn't exist
    const user =  await this.userService.findByEmail(body.email);
    if (user) throw new ConflictException("Bad Credentials");
    
    // hash password
    body.password = await argon2.hash(body.password);    

    // create user
    const newUser = await this.userService.create(body);

    return {
      message: "Utilisateur créé avec succès",
      email: newUser.email
    }

  }

  @Get("refresh-token")
  async refreshToken(@Req() req: IRequestWithRefreshToken, @Res({passthrough: true}) res : Response) {

    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token) {
      throw new UnauthorizedException("Missing refresh token");
    }
    
    let decoded: IPayloadType;
    try {
      decoded = await this.authService.verifyJwt(
        refresh_token,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Check if the token matches stored hash
    const stored = await this.authService.getByUnique(decoded.sub, TypeTokenEnum.REFRESH_TOKEN);
    if (!stored || !(await argon2.verify(stored.token, refresh_token))) {
      throw new UnauthorizedException("Refresh token does not match");
    }

    // Create new tokens
    const payload: IPayloadType = {
      sub: decoded.sub,
      role: decoded.role,
    };

    const newAccessToken = await this.authService.createJwt(
      payload,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );

    const newRefreshToken = await this.authService.createJwt(
      payload,
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES_IN
    );

    await this.authService.upsertToken(
      decoded.sub,
      await argon2.hash(newRefreshToken),
      TypeTokenEnum.REFRESH_TOKEN
    );

    // Set new cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    // Return only new access token
    return {
      newAccessToken
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      const payload = await this.authService.verifyJwt(refreshToken, process.env.JWT_REFRESH_SECRET);
      await this.authService.deleteToken(payload.sub); // remove stored hashed token
        // Clear cookie client-side
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token'
      });

    }

    // No body is returned (204 No Content)
  }

}
