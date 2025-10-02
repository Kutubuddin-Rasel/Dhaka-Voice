import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Controller('locations')
export class LocationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('thanas')
  async thanas(@Query('q') q?: string) {
    const where = q ? { name: { contains: q, mode: Prisma.QueryMode.insensitive } } : {};
    const items = await this.prisma.thana.findMany({ where, orderBy: { name: 'asc' } });
    return { items };
  }

  @Get('wards')
  async wards(@Query('corp') corp?: 'DNCC' | 'DSCC') {
    const where = corp ? { cityCorporation: corp } : {} as any;
    const items = await this.prisma.ward.findMany({ where, orderBy: [{ cityCorporation: 'asc' }, { wardNumber: 'asc' }] });
    return { items };
  }
}


