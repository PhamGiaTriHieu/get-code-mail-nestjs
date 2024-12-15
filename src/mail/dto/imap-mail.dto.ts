import { IsEmail, IsNotEmpty } from 'class-validator';

export class ImapMailDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Định dạng email không đúng' })
  email: string;
}
