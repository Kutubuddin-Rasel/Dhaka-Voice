import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('complaints/:complaintId/comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Get()
	list(@Param('complaintId') complaintId: string) {
		return this.commentsService.list(complaintId);
	}

	@UseGuards(AuthGuard('jwt'))
	@Post()
	create(@Req() req: Request, @Param('complaintId') complaintId: string, @Body() dto: CreateCommentDto) {
		// @ts-ignore
		const userId = (req as any).user.userId as string;
		return this.commentsService.create(complaintId, userId, dto);
	}

	@UseGuards(AuthGuard('jwt'))
	@Delete(':commentId')
	remove(@Req() req: Request, @Param('commentId') commentId: string) {
		// @ts-ignore
		const userId = (req as any).user.userId as string;
		return this.commentsService.remove(commentId, userId);
	}
}
