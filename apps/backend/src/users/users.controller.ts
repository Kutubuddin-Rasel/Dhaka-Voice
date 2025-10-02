import { Controller, Get, Patch, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Req() req: Request, @Body() data: { name: string }) {
    // @ts-ignore passport user typing
    const userId = (req as any).user.userId as string;
    return this.usersService.updateProfile(userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  getUserStats(@Req() req: Request) {
    // @ts-ignore passport user typing
    const userId = (req as any).user.userId as string;
    return this.usersService.getUserStats(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('export-data')
  exportUserData(@Req() req: Request) {
    // @ts-ignore passport user typing
    const userId = (req as any).user.userId as string;
    return this.usersService.exportUserData(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  deleteUserAccount(@Req() req: Request) {
    // @ts-ignore passport user typing
    const userId = (req as any).user.userId as string;
    return this.usersService.deleteUserAccount(userId);
  }
}
