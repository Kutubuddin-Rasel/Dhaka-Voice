import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto:SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.createUser({ email: dto.email, passwordHash, name: dto.name });
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async login(dto:LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  private async issueTokens(userId: string, email: string) {
    const accessTtl = this.config.get<string>('ACCESS_TOKEN_EXPIRY', '15m');
    const refreshTtl = this.config.get<string>('REFRESH_TOKEN_EXPIRY', '7d');
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret: this.config.get<string>('JWT_ACCESS_SECRET')!, expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, type: 'refresh' },
      { secret: this.config.get<string>('JWT_REFRESH_SECRET')!, expiresIn: refreshTtl },
    );
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, email: string) {
    return this.issueTokens(userId, email);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // Get the user to verify current password
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(dto.newPassword);

    // Update password in database
    await this.usersService.updatePassword(userId, newPasswordHash);

    return { message: 'Password changed successfully' };
  }
}
