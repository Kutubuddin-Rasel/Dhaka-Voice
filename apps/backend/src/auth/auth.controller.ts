import { Body, Controller, Get, HttpCode, Post, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// DTOs moved to dedicated files for maintainability

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return;
  }

  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Res({ passthrough: true }) res: Response) {
    // Passport attaches user to request
    const req: any = (res as any).req;
    const { userId, email } = req.user;
    const { accessToken, refreshToken } = await this.authService.refresh(userId, email);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    // @ts-ignore passport user typing
    const userId = (req as any).user.userId as string;
    return this.authService.changePassword(userId, dto);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour default; token expiry still enforced by JWT
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    });
  }
}
