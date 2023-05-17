import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsNumber } from 'class-validator';

export class CreateOrUpdateNoteDto {
    @IsString()
    @IsNotEmpty()
    public body: string;
  }


export class ShareNoteWithUserDto {
    @IsNumber()
    @IsNotEmpty()
    public userId: number;
}  