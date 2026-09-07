import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Dashboard } from './entities/dashboard.entity';
import { IRequestWithUser } from 'src/auth/types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(
    @Req() req: IRequestWithUser
  ): Promise<Dashboard> {
    return this.dashboardService.getDashboardData(req.user.sub);
  }

}
