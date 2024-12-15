import { ResponseMessage } from 'src/decorators/customize';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { ImapMailDto } from 'src/mail/dto/imap-mail.dto';

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

  @Post('imap-mail-code')
  @ResponseMessage('Get code successfully')
  async getImapMailCode(@Body() requestBody: ImapMailDto) {
    const text = 'Mã truy cập Netflix tạm thời của bạn';
    const sender = 'info@account.netflix.com';
    const maiForwardTo = requestBody.email;

    // const text = 'Test get code';
    // const sender = 'phamgiatrihieu@gmail.com';

    return this.mailService.getSpecificMail(sender, text, maiForwardTo);
  }
}
