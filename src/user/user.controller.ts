import { Controller, Post, Body, Param, Put, Req, ParseIntPipe, UnauthorizedException, Patch } from '@nestjs/common';
import { UserService, UserWithoutPassword } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IRequestWithUser } from 'src/auth/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { TrimesterEnum } from 'prisma/generated/browser';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

   @Put('preferences/:id')
  async updatePreferences(
    @Body() updatePreferencesDto : UpdatePreferencesDto,
    @Req() req : IRequestWithUser,
    @Param('id', ParseIntPipe) id: number
  ) : Promise<TrimesterEnum> {
      if(req.user.sub !== id) {
        throw new UnauthorizedException("You're not allowed to edit this profile's preferences.")
      }
      return this.userService.updatePreferences(updatePreferencesDto, id)
    }


  @Put(':id')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req : IRequestWithUser,
    @Param('id', ParseIntPipe) id: number
  ) : Promise<UserWithoutPassword> {
      if(req.user.sub !== id) {
        throw new UnauthorizedException("You're not allowed to edit this profile.")
      }
      return this.userService.updateProfile(updateProfileDto, id)
    }


  @Patch('first-visit')
  async disableFirstVisit(
    @Req() req: IRequestWithUser
  ) {
    return this.userService.disableIsFirstVisit(req.user.sub);
  }
}
