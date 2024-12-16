import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class AppService {
  // Đặt URL của API mà bạn muốn gọi
  private readonly apiUrl =
    'https://portfolio-be-mongodb.onrender.com/api/v1/portfolios/home/my-portfolio';
  getHello(): string {
    return 'Biết ngay mà thế nào củng vào để xem có Hello World không chứ gì ??';
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  autoCallPortfolio() {
    this.callApi();
  }

  async callApi() {
    try {
      const response = await axios.get(this.apiUrl);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }
}
