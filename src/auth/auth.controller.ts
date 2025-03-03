import { Body, ConflictException, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { UserService } from 'src/user/user.service';
import argon2 from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IPayloadType } from './types';
import { TypeTokenEnum } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    // private readonly jwtService: JwtService
  ) {}


  // sign in -- Connexion
  @HttpCode(HttpStatus.OK)
  @Post("signin")
  async signin(
  @Body() body: SignInDto
  ) {
    // check user email
    const user =  await this.userService.findByEmail(body.email);
    if (!user) throw new ConflictException("Bad Credentials");

    // check user is validated
    if (!user.is_validated) {
      throw new ConflictException("Please verify your email before signing in",);
    }

    // check password
    const compare = await argon2.verify(user.password, body.password);
    if (!compare) throw new ConflictException("Bad Credentials");

    // create payload
    const payload: IPayloadType = {
      sub: user.id,
      role: user.role
    }

    // generate access token
    const access_token = await this.authService.createJwt(payload, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);

    
    // generate refresh token
    const refresh_token = await this.authService.createJwt(payload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

    // create or update refresh token
    await this.authService.upsertToken(user.id, await argon2.hash(refresh_token), TypeTokenEnum.REFRESH_TOKEN)

    return {
      access_token, refresh_token
    }
  }

  // sign up -- Inscription
  @Post("signup")
  async signup(
  @Body() body: CreateUserDto
  ) {
    // check user email doesn't exist
    const user =  await this.userService.findByEmail(body.email);
    if (user) throw new ConflictException("Bad Credentials");

    // hash password
    body.password = await argon2.hash(body.password);

    // create user
    const newUser = await this.userService.create(body);

    // send email

    return {user: newUser}
  }

}
