import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UpvotesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationsService: NotificationsService,
	) {}

	async toggle(complaintId: string, userId: string) {
		const existing = await this.prisma.upvote.findUnique({ where: { complaintId_userId: { complaintId, userId } } });
		if (existing) {
			await this.prisma.upvote.delete({ where: { complaintId_userId: { complaintId, userId } } });
			return { upvoted: false };
		}
		
		// Get complaint details for notification
		const complaint = await this.prisma.complaint.findUnique({
			where: { id: complaintId },
			select: { id: true, title: true, userId: true },
		});
		
		await this.prisma.upvote.create({ data: { complaintId, userId } });
		
		// Send notification to complaint owner if it's not their own upvote
		if (complaint && complaint.userId !== userId) {
			try {
				const upvoter = await this.prisma.user.findUnique({
					where: { id: userId },
					select: { name: true },
				});
				
				if (upvoter) {
					await this.notificationsService.createUpvoteNotification(
						complaintId,
						complaint.title,
						upvoter.name,
						complaint.userId,
					);
				}
			} catch (error) {
				// Log error but don't fail the upvote
				console.error('Failed to send upvote notification:', error);
			}
		}
		
		return { upvoted: true };
	}
}
