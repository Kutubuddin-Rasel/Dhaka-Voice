import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email!: string;

  @IsNotEmpty()
  password!: string;
}


