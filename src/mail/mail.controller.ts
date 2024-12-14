import { ResponseMessage } from 'src/decorators/customize';
import { Controller, Get, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name);
  constructor(private readonly mailService: MailService) {}

  @Get('end-connect-imap')
  @ResponseMessage('Ending to IMAP successfully')
  async endConnectImap() {
    return this.mailService.endToImapServer();
  }

  @Get('imap-mail')
  @ResponseMessage('Get to IMAP successfully')
  async getImapMail() {
    return this.mailService.getMail();
  }

  @Get('imap-mail-code')
  @ResponseMessage('Get code successfully')
  async getImapMailCode() {
    const text = 'Mã truy cập Netflix tạm thời của bạn';
    const sender = 'info@account.netflix.com';
    return this.mailService.getSpecificMail(sender, text);
  }
}
