import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const ImapProvider: Provider = {
  provide: 'IMAP_CONFIG',
  useFactory: async (configService: ConfigService) => {
    const config = {
      imap: {
        user: configService.get('EMAIL_GETCODE_USER'),
        password: configService.get('EMAIL_GETCODE_PASSWORD'),
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      },
    };
    return config;
  },
  inject: [ConfigService],
};
