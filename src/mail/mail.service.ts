import { Inject, Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import * as imaps from 'imap-simple';

@Injectable()
export class MailService {
  private imapConnection: imaps.ImapSimple;

  constructor(@Inject('IMAP_CONFIG') private readonly imapConfig) {}

  extractLinkFromText(text: string): string | null {
    // Regex để tìm từ "Nhận mã" và link trong dấu []
    const regex = /Nhận mã\s*\[(https?:\/\/[^\]]+)\]/;

    // Tìm kiếm kết quả khớp
    const match = text.match(regex);

    // Nếu tìm thấy, trả về link; nếu không, trả về null
    return match ? match[1] : null;
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
  ): Promise<any> {
    try {
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
        markSeen: false, // Không đánh dấu là đã đọc
      };

      // Tìm email phù hợp
      const results = await this.imapConnection.search(
        searchCriteria,
        fetchOptions,
      );

      if (results.length === 0) {
        return { message: 'No emails found' };
      }

      const email = results[results.length - 1];

      const all = email.parts.find((part) => part?.which);

      const idHeader = `Imap-Id: ${email?.attributes?.uid}\r\n`;
      const mail = await simpleParser(idHeader + all + all?.body);

      // const plainText = mail.text?.split('\n--')[0]?.trim(); // Xử lý và loại bỏ các boundary dư thừa
      const plainTextNetflix = mail.text?.replace(/\n/g, ' ')?.trim();

      const linkGetCode = this.extractLinkFromText(plainTextNetflix);

      return linkGetCode;
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