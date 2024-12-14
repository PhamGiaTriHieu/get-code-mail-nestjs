import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ImapProvider } from 'src/mail/imap.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [MailService, ImapProvider],
})
export class MailModule {}
