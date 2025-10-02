import { Controller, Get, Post, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getNotifications(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    
    return this.notificationsService.findByUserId(userId, pageNum, pageSizeNum);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  async markAsRead(@Req() req: Request, @Param('id') id: string) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    return this.notificationsService.markAsRead(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: Request) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    return this.notificationsService.markAllAsRead(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/archive')
  async archive(@Req() req: Request, @Param('id') id: string) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    return this.notificationsService.archive(id, userId);
  }
}
