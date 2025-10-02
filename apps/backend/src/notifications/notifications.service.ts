import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationStatus } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  complaintId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
        complaintId: dto.complaintId,
      },
      include: {
        complaint: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          complaint: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async archive(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: NotificationStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  // Helper method to create complaint-related notifications
  async createComplaintStatusNotification(
    complaintId: string,
    complaintTitle: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.COMPLAINT_STATUS_UPDATE,
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaintTitle}" status has been updated from ${oldStatus} to ${newStatus}.`,
      data: { oldStatus, newStatus },
      complaintId,
    });
  }

  async createCommentNotification(
    complaintId: string,
    complaintTitle: string,
    commenterName: string,
    userId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.COMPLAINT_COMMENT,
      title: 'New Comment on Your Complaint',
      message: `${commenterName} commented on your complaint "${complaintTitle}".`,
      data: { commenterName },
      complaintId,
    });
  }

  async createUpvoteNotification(
    complaintId: string,
    complaintTitle: string,
    upvoterName: string,
    userId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.COMPLAINT_UPVOTE,
      title: 'New Upvote on Your Complaint',
      message: `${upvoterName} upvoted your complaint "${complaintTitle}".`,
      data: { upvoterName },
      complaintId,
    });
  }
}
