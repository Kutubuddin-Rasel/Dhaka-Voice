import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/create-complaint.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('complaints')
export class ComplaintsController {
	constructor(private readonly complaintsService: ComplaintsService) {}

	@Get()
	list(@Query() query: PaginationDto & { type?: string; search?: string; sort?: 'latest' | 'top' | 'oldest'; userId?: string }) {
		return this.complaintsService.findAll(query);
	}

	@Get(':id')
	getOne(@Param('id') id: string) {
		return this.complaintsService.findOne(id);
	}

	@UseGuards(AuthGuard('jwt'))
	@Post()
	create(@Req() req: Request, @Body() dto: CreateComplaintDto) {
		// @ts-ignore passport user typing
		const userId = (req as any).user.userId as string;
		return this.complaintsService.create(userId, dto);
	}

	@UseGuards(AuthGuard('jwt'))
	@Patch(':id')
	update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateComplaintDto) {
		// @ts-ignore passport user typing
		const userId = (req as any).user.userId as string;
		return this.complaintsService.update(id, userId, dto);
	}

	@UseGuards(AuthGuard('jwt'))
	@Delete(':id')
	remove(@Req() req: Request, @Param('id') id: string) {
		// @ts-ignore passport user typing
		const userId = (req as any).user.userId as string;
		return this.complaintsService.remove(id, userId);
	}

	@UseGuards(AuthGuard('jwt'))
	@Patch(':id/status')
	updateStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: { status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' }) {
		// @ts-ignore passport user typing
		const userId = (req as any).user.userId as string;
		return this.complaintsService.updateStatus(id, userId, dto.status);
	}
}
