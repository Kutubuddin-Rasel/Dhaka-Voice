import { Module } from '@nestjs/common';
import { UpvotesService } from './upvotes.service';
import { UpvotesController } from './upvotes.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [UpvotesService],
  controllers: [UpvotesController]
})
export class UpvotesModule {}
