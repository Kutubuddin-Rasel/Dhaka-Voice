import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupDto {
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email!: string;

  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  name!: string;
}


