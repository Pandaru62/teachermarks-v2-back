import { Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IPayloadType, IRequestWithRefreshToken } from './types';
import { TypeTokenEnum } from '@prisma/client';
import { ResfreshGuard } from './refresh.guard';
import { Public } from 'src/decorators/public.decorator';

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
  @Body() body: SignInDto
  ) {
    // check user email
    const userFound =  await this.userService.findByEmail(body.email);
    if (!userFound) throw new ConflictException("Bad Credentials");

    // check user is validated
    if (!userFound.is_validated) {
      throw new ConflictException("Please verify your email before signing in",);
    }

    // check password
    const compare = await argon2.verify(userFound.password, body.password);
    if (!compare) throw new ConflictException("Bad Credentials");

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

    return {
      access_token,
      refresh_token,
      user: {
        email: userFound.email,
        firstname: userFound.profile.firstname,
        lastname: userFound.profile.lastname,
        school: userFound.profile.school,
        id: userFound.id
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

    // send email

    return {user: newUser}

  }


  @UseGuards(ResfreshGuard)
  @Get("refresh-token")
  async refreshToken(@Req() req: IRequestWithRefreshToken) {
    // Récupération du token de rafraîchissement dans la base de données
    const { token } = await this.authService.getByUnique(req.user.sub, TypeTokenEnum.REFRESH_TOKEN);
    // Vérification si le token de rafraîchissement est valide
    if (!(await argon2.verify(token, req.refreshToken))) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    // Création du payload
    const payload: IPayloadType = {
      sub: req.user.sub,
      role: req.user.role,
    };
    // Création du token d'accès
    const access_token = await this.authService.createJwt(
      payload,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );
    // Création du token de rafraîchissement
    const refresh_token = await this.authService.createJwt(
      payload,
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES_IN
    );
    // Création/mise à jour du token de rafraîchissement dans la base de données
    await this.authService.upsertToken(
      req.user.sub,
      await argon2.hash(refresh_token),
      TypeTokenEnum.REFRESH_TOKEN
    );
    // Retour success
    return {
      access_token,
      refresh_token,
    };
  }

}
