import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { ImagesController } from './images.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, SupabaseModule, NotificationsModule],
  controllers: [ComplaintsController, ImagesController],
  providers: [ComplaintsService],
})
export class ComplaintsModule {}