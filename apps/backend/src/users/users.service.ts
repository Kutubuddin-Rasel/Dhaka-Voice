import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async updateProfile(userId: string, data: { name: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getUserStats(userId: string) {
    const [complaintsCount, commentsCount, upvotesGiven] = await Promise.all([
      // Count complaints submitted by user
      this.prisma.complaint.count({
        where: { userId }
      }),
      // Count comments made by user
      this.prisma.comment.count({
        where: { userId }
      }),
      // Count upvotes given by user (excluding their own complaints)
      this.prisma.upvote.count({
        where: {
          userId,
          complaint: {
            userId: { not: userId } // Exclude upvotes on own complaints
          }
        }
      })
    ]);

    return {
      complaintsSubmitted: complaintsCount,
      commentsMade: commentsCount,
      upvotesGiven: upvotesGiven
    };
  }

  async exportUserData(userId: string) {
    // Get all user data
    const [user, complaints, comments, upvotes] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      this.prisma.complaint.findMany({
        where: { userId },
        include: {
          images: true,
          _count: { select: { upvotes: true, comments: true } },
          thana: { select: { id: true, name: true } },
          ward: { select: { id: true, wardNumber: true, cityCorporation: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.comment.findMany({
        where: { userId },
        include: {
          complaint: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.upvote.findMany({
        where: { userId },
        include: {
          complaint: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      user,
      complaints,
      comments,
      upvotes,
      exportedAt: new Date().toISOString(),
      totalComplaints: complaints.length,
      totalComments: comments.length,
      totalUpvotes: upvotes.length
    };
  }

  async deleteUserAccount(userId: string) {
    // Delete user and all related data (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: 'Account deleted successfully' };
  }
}
