import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(complaintId: string) {
    return this.prisma.comment.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async create(complaintId: string, userId: string, dto: CreateCommentDto) {
    const complaint = await this.prisma.complaint.findUnique({ 
      where: { id: complaintId }, 
      select: { id: true, title: true, userId: true } 
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    
    const comment = await this.prisma.comment.create({ 
      data: { complaintId, userId, content: dto.content },
      include: { user: { select: { id: true, name: true } } }
    });

    // Send notification to complaint owner if it's not their own comment
    if (complaint.userId !== userId) {
      try {
        await this.notificationsService.createCommentNotification(
          complaintId,
          complaint.title,
          comment.user.name,
          complaint.userId,
        );
      } catch (error) {
        // Log error but don't fail the comment creation
        console.error('Failed to send comment notification:', error);
      }
    }

    return comment;
  }

  async remove(commentId: string, userId: string) {
    const existing = await this.prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true } });
    if (!existing) throw new NotFoundException('Comment not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your comment');
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  }
}
