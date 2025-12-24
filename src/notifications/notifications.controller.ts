import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserRoleEnum } from 'prisma/generated/enums';
import { Roles } from 'src/decorators/roles.decorator';
import { notifications } from 'prisma/generated/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRoleEnum.ADMIN)
  @Post()
  async create(@Body() body: CreateNotificationDto): Promise<notifications> {
    return this.notificationsService.create(body);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Post()
  async createAndPublish(@Body() body: CreateNotificationDto): Promise<notifications> {
    // create notification
    const newNotif = await this.notificationsService.create(body);
    // publish to users
    await this.notificationsService.publishNotificationToUsers(newNotif.id);
    return newNotif;
  }

  @Roles(UserRoleEnum.ADMIN)
  @Post()
  async publish(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.publishNotificationToUsers(id);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Get()
  async findAll(): Promise<notifications[]> {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<notifications> {
    return this.notificationsService.findOne(id);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateNotificationDto): Promise<notifications> {
    return this.notificationsService.update(id, body);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<notifications> {
    return this.notificationsService.remove(+id);
  }
}
