import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import * as imaps from 'imap-simple';
import { emailList } from './entities/emailData.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private imapConnection: imaps.ImapSimple;

  constructor(
    @Inject('IMAP_CONFIG') private readonly imapConfig,
    private readonly mailerService: MailerService,
  ) {}

  extractLinkFromText(text: string): string | null {
    // Regex để tìm từ "Nhận mã" và link trong dấu []
    const regex = /Nhận mã\s*\[(https?:\/\/[^\]]+)\]/;

    // Tìm kiếm kết quả khớp
    const match = text.match(regex);

    // Nếu tìm thấy, trả về link; nếu không, trả về null
    return match ? match[1] : null;
  }

  extractProfileName(text: string) {
    // Biểu thức chính quy để tìm phần sau "của bạn"
    // const regexAfter = /của bạn\s*(.*)/;
    const regex = /của bạn\s*(.*?)(?:,|$)/;

    // Tìm kiếm kết quả khớp
    const matchFirst = text.match(regex)[1].trim();

    if (matchFirst) {
      const regexAfter = /của bạn\s*(.*)/;
      const profileName = matchFirst.match(regexAfter)[1].trim();
      return profileName;
    }

    return 'Not Found Profile Name';
  }

  async endToImapServer() {
    try {
      this.imapConnection = await imaps.connect(this.imapConfig);
      return this.imapConnection.end();
    } catch (error) {
      console.log('🚀 ~ MailService ~ endToImapServer ~ error:', error);
      throw new Error('Failed to connect to IMAP server');
    }
  }

  async getMail(): Promise<string[]> {
    try {
      // Kết nối tới IMAP server
      this.imapConnection = await imaps.connect(this.imapConfig);

      // Mở hộp thư INBOX
      await this.imapConnection.openBox('INBOX');

      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
      };

      // Tìm email dựa trên tiêu chí
      const results = await this.imapConnection.search(
        searchCriteria,
        fetchOptions,
      );

      // Lấy tiêu đề email từ kết quả
      const subjects = results.map((res) => {
        const headerPart = res.parts.find((part) => part.which === 'HEADER');
        return headerPart?.body?.subject?.[0] || 'No Subject';
      });

      console.log('Subjects:', subjects);
      return subjects;
    } catch (error) {
      console.error('🚀 ~ MailService ~ getMail ~ error:', error);
      throw error; // Ném lỗi để controller xử lý
    } finally {
      // Đảm bảo đóng kết nối sau khi xử lý
      if (this.imapConnection) {
        await this.imapConnection.end();
        this.imapConnection = null;
      }
    }
  }

  async getSpecificMail(
    senderEmail: string,
    subjectText: string,
    mailForwardTo: string,
  ): Promise<any> {
    try {
      const mailForward =
        mailForwardTo.charAt(0).toLowerCase() + mailForwardTo.slice(1);

      console.log(mailForward);
      // check mail
      if (!emailList.includes(mailForward)) {
        throw new HttpException(
          'Email không nằm trong danh sách truy cập Netflix',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kết nối tới IMAP server
      this.imapConnection = await imaps.connect(this.imapConfig);

      // Mở hộp thư INBOX
      await this.imapConnection.openBox('INBOX');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayISOString = today.toISOString(); // Format ISO 8601

      // Thiết lập tiêu chí tìm kiếm
      const searchCriteria = [
        ['SINCE', todayISOString],
        ['FROM', senderEmail], // Lọc theo địa chỉ email
        ['SUBJECT', subjectText], // Lọc theo tiêu đề
      ];

      // Tùy chọn fetch email
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'], // Lấy cả tiêu đề và nội dung
        markSeen: false,
      };

      // Tìm email phù hợp
      const results = await this.imapConnection.search(
        searchCriteria,
        fetchOptions,
      );

      if (results.length === 0) {
        throw new HttpException(
          'Chưa có mã mới! vui lòng bấm nhận mã ở thiết bị yêu cầu',
          HttpStatus.NOT_FOUND,
        );
      }

      const email = results[results.length - 1];

      const all = email.parts.find((part) => part?.which);

      const idHeader = `Imap-Id: ${email?.attributes?.uid}\r\n`;
      const mail = await simpleParser(idHeader + all + all?.body);

      // const plainText = mail.text?.split('\n--')[0]?.trim(); // Xử lý và loại bỏ các boundary dư thừa
      const plainTextNetflix = mail.text?.replace(/\n/g, ' ')?.trim();

      const linkGetCode = this.extractLinkFromText(plainTextNetflix);

      const profileName = this.extractProfileName(plainTextNetflix);

      await this.mailerService.sendMail({
        to: mailForward,
        from: '"Pham Gia Tri Hieu" <hieupro58@gmail.com>', // override default from
        subject: 'Nhận mã Netflix tạm thời',
        template: 'get-code', // name of the template file in templates folder It configured in module
        context: {
          fullName: `${mailForward}`,
          url: linkGetCode,
        },
      });

      return {
        link: linkGetCode,
        profileName,
      };
    } catch (error) {
      console.error('🚀 ~ MailService ~ getSpecificMail ~ error:', error);
      throw error;
    } finally {
      // Đảm bảo đóng kết nối sau khi xử lý
      if (this.imapConnection) {
        await this.imapConnection.end();
        this.imapConnection = null;
      }
    }
  }
}
