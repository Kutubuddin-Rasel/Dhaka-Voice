import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ComplaintType, ComplaintStatus } from '@prisma/client';

export class CreateComplaintDto {
	@IsEnum(ComplaintType)
	type!: ComplaintType;

	@IsString()
	@MinLength(4)
	@MaxLength(120)
	title!: string;

	@IsString()
	@MinLength(10)
	@MaxLength(5000)
	description!: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	thanaId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	wardId?: number;

	@IsOptional()
	@IsEnum(ComplaintStatus)
	status?: ComplaintStatus;
}

export class UpdateComplaintDto {
	@IsOptional()
	@IsEnum(ComplaintType)
	type?: ComplaintType;

	@IsOptional()
	@IsString()
	@MinLength(4)
	@MaxLength(120)
	title?: string;

	@IsOptional()
	@IsString()
	@MinLength(10)
	@MaxLength(5000)
	description?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	thanaId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	wardId?: number;

	@IsOptional()
	@IsEnum(ComplaintStatus)
	status?: ComplaintStatus;
}
