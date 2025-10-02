import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UpvotesService } from './upvotes.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('complaints/:complaintId/upvote')
export class UpvotesController {
	constructor(private readonly upvotesService: UpvotesService) {}

	@UseGuards(AuthGuard('jwt'))
	@Post('toggle')
	toggle(@Req() req: Request, @Param('complaintId') complaintId: string) {
		// @ts-ignore
		const userId = (req as any).user.userId as string;
		return this.upvotesService.toggle(complaintId, userId);
	}
}
