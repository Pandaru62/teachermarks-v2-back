import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'prisma/prisma.service';
import { notifications, UserRoleEnum } from 'prisma/generated/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<notifications[]> {
    return this.prismaService.notifications.findMany({});
  }
  
  async findOne(id: number): Promise<notifications> {
    return this.prismaService.notifications.findUnique({
      where: { id },
    });
  }

  async findLastUnreadNotification(userId: number): Promise<notifications> {
    const lastNotif = await this.prismaService.userHasNotifications.findFirst({
      where: { 
          userId,
          isRead: false
       },
        orderBy: {
          notification: {
            createdAt: 'desc'
          }
        }
    });

    return this.prismaService.notifications.findUnique({
      where: { id: lastNotif.notificationId },
    });
  }
  
  async create(createNotificationDto: CreateNotificationDto): Promise<notifications> {
    return this.prismaService.notifications.create({
      data: createNotificationDto
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<notifications> {
    return this.prismaService.notifications.update({
      where: { id },
      data: updateNotificationDto
    });
  }

  async publishNotificationToUsers(notificationId: number) {
    const userIds = await this.prismaService.user.findMany({
      where: { role: UserRoleEnum.TEACHER },
      select: { id: true }
    })

    return this.prismaService.userHasNotifications.createMany({
      data: userIds.map(user => ({
        notificationId,
        userId: user.id,
        isRead: false
      }))
    });
  }

  remove(id: number) : Promise<notifications> {
    return this.prismaService.notifications.delete({
      where: { id }
    });
  }
}
