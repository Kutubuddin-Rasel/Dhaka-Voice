import { BadRequestException, Controller, Delete, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
// Use CommonJS require to avoid ESM/CJS interop issues with sharp
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import * as multer from 'multer';
import { randomUUID } from 'node:crypto';

@Controller('complaints/:complaintId/images')
export class ImagesController {
  constructor(private readonly supabase: SupabaseService, private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 3, { storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } }))
  async upload(@Req() req: Request, @Param('complaintId') complaintId: string, @UploadedFiles() files: any[]) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    const complaint = await this.prisma.complaint.findUnique({ where: { id: complaintId }, select: { userId: true } });
    if (!complaint) throw new BadRequestException('Complaint not found');
    if (complaint.userId !== userId) throw new BadRequestException('Not your complaint');

    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    if (files.length > 3) throw new BadRequestException('Maximum 3 images allowed');

    const bucket = this.supabase.getBucket();
    const client = this.supabase.getClient();

    const results: any[] = [];
    let indexOffset = await this.prisma.complaintImage.count({ where: { complaintId } });
    try {
      if (typeof sharp !== 'function') {
        throw new BadRequestException('Image processor not available');
      }
      for (const [i, file] of files.entries()) {
        // Restrict to widely-supported formats on server
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          throw new BadRequestException('Unsupported image type');
        }
        if (file.size > 4 * 1024 * 1024) throw new BadRequestException('Image too large (max 4MB)');

        const image = sharp(file.buffer, { failOn: 'none' });
        const optimized = await image.rotate().resize({ width: 1920, height: 1080, fit: 'inside' }).webp({ quality: 80 }).toBuffer();
        const medium = await sharp(optimized).resize({ width: 1024, height: 768, fit: 'inside' }).toBuffer();
        const thumb = await sharp(optimized).resize({ width: 320, height: 320, fit: 'cover' }).toBuffer();

        const id = randomUUID();
        const basePath = `complaints/${complaintId}/${id}`;

        const uploads = [
          { path: `${basePath}_original.webp`, data: optimized },
          { path: `${basePath}_medium.webp`, data: medium },
          { path: `${basePath}_thumb.webp`, data: thumb },
        ];

        for (const u of uploads) {
          const { error } = await client.storage.from(bucket).upload(u.path, u.data, { contentType: 'image/webp', upsert: true });
          if (error) throw new BadRequestException('Upload failed: ' + error.message);
        }

        const meta = await sharp(optimized).metadata();
        const created = await this.prisma.complaintImage.create({
          data: {
            complaintId,
            orderIndex: indexOffset + i,
            mimeType: 'image/webp',
            width: meta.width ?? null,
            height: meta.height ?? null,
            sizeBytes: optimized.length,
            pathOriginal: `${basePath}_original.webp`,
            pathMedium: `${basePath}_medium.webp`,
            pathThumb: `${basePath}_thumb.webp`,
          },
        });
        results.push(created);
      }
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Image processing/upload failed');
    }

    return { images: results };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':imageId')
  async delete(@Req() req: Request, @Param('complaintId') complaintId: string, @Param('imageId') imageId: string) {
    // @ts-ignore
    const userId = (req as any).user.userId as string;
    const image = await this.prisma.complaintImage.findUnique({ where: { id: imageId } });
    if (!image || image.complaintId !== complaintId) throw new BadRequestException('Image not found');
    const complaint = await this.prisma.complaint.findUnique({ where: { id: complaintId }, select: { userId: true } });
    if (!complaint || complaint.userId !== userId) throw new BadRequestException('Not your complaint');

    const bucket = this.supabase.getBucket();
    const client = this.supabase.getClient();
    const toRemove = [image.pathOriginal, image.pathMedium, image.pathThumb].filter(Boolean) as string[];
    if (toRemove.length > 0) {
      const { error } = await client.storage.from(bucket).remove(toRemove);
      if (error) throw new BadRequestException('Deletion failed: ' + error.message);
    }
    await this.prisma.complaintImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}


