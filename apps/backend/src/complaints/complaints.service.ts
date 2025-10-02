import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/create-complaint.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly supabase: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        thanaId: dto.thanaId ?? null,
        wardId: dto.wardId ?? null,
      },
    });
  }

  async findAll(query: PaginationDto & { type?: string; search?: string; sort?: 'latest' | 'top' | 'oldest'; userId?: string }) {
    try {
      const { page = 1 as any, pageSize = 20 as any, type, search, sort = 'latest', userId } = query;
      const currentPage = Math.max(1, typeof page === 'string' ? parseInt(page, 10) || 1 : page);
      const size = Math.max(1, typeof pageSize === 'string' ? parseInt(pageSize, 10) || 20 : pageSize);
      const where: any = {};

      // Filter by user if userId is provided
      if (userId) {
        where.userId = userId;
      }

      // Validate type against enum to avoid Prisma error
      const validTypes = ['ROADS','ELECTRICITY','WATER','POLLUTION','TRANSPORT','OTHERS'];
      if (type && validTypes.includes(type)) {
        where.type = type;
      }

      if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];

      // Build order by dynamically
      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'top') {
        // Most upvoted first; fallback to createdAt for stable ordering
        orderBy = [
          { upvotes: { _count: 'desc' } } as any,
          { createdAt: 'desc' } as const,
        ];
      } else if (sort === 'oldest') {
        // Oldest first
        orderBy = { createdAt: 'asc' };
      }
      const [itemsRaw, total] = await this.prisma.$transaction([
        this.prisma.complaint.findMany({
          where,
          orderBy,
          skip: (currentPage - 1) * size,
          take: size,
          include: { 
            _count: { select: { upvotes: true, comments: true } }, 
            images: true, 
            user: { select: { id: true, name: true } },
            thana: { select: { id: true, name: true } },
            ward: { select: { id: true, wardNumber: true, cityCorporation: true } }
          },
        }),
        this.prisma.complaint.count({ where }),
      ]);
      const items = await Promise.all(itemsRaw.map(async (c) => ({
        ...c,
        images: await Promise.all((c.images ?? []).map(async (img) => ({
          ...img,
          signedThumbUrl: img.pathThumb ? await this.supabase.getSignedUrl(img.pathThumb) : null,
          signedMediumUrl: img.pathMedium ? await this.supabase.getSignedUrl(img.pathMedium) : null,
          signedOriginalUrl: img.pathOriginal ? await this.supabase.getSignedUrl(img.pathOriginal) : null,
        }))),
      })));
      return { items, total, page: currentPage, pageSize: size };
    } catch (err) {
      // Log and rethrow a generic error to avoid leaking internals
      // eslint-disable-next-line no-console
      console.error('findAll complaints error:', err);
      throw err;
    }
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, name: true } },
        _count: { select: { upvotes: true, comments: true } },
        thana: { select: { id: true, name: true } },
        ward: { select: { id: true, wardNumber: true, cityCorporation: true } }
      },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    const images = await Promise.all((complaint.images ?? []).map(async (img) => ({
      ...img,
      signedThumbUrl: img.pathThumb ? await this.supabase.getSignedUrl(img.pathThumb) : null,
      signedMediumUrl: img.pathMedium ? await this.supabase.getSignedUrl(img.pathMedium) : null,
      signedOriginalUrl: img.pathOriginal ? await this.supabase.getSignedUrl(img.pathOriginal) : null,
    })));
    return { ...complaint, images };
  }

  async update(id: string, userId: string, dto: UpdateComplaintDto) {
    const existing = await this.prisma.complaint.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) throw new NotFoundException('Complaint not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your complaint');
    return this.prisma.complaint.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.complaint.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) throw new NotFoundException('Complaint not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your complaint');
    await this.prisma.complaint.delete({ where: { id } });
    return { success: true };
  }

  async updateStatus(id: string, userId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    if (complaint.userId !== userId) throw new ForbiddenException('You can only update your own complaints');
    
    const oldStatus = complaint.status;
    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: { status },
      include: { 
        _count: { select: { upvotes: true, comments: true } }, 
        images: true, 
        user: { select: { id: true, name: true } },
        thana: { select: { id: true, name: true } },
        ward: { select: { id: true, wardNumber: true, cityCorporation: true } }
      }
    });

    // Send notification if status actually changed
    if (oldStatus !== status) {
      try {
        await this.notificationsService.createComplaintStatusNotification(
          id,
          complaint.title,
          oldStatus,
          status,
          userId,
        );
      } catch (error) {
        // Log error but don't fail the status update
        console.error('Failed to send status notification:', error);
      }
    }

    return updatedComplaint;
  }
}
