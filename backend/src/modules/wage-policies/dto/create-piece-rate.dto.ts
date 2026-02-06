import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePieceRateDto {
    @IsString()
    @IsNotEmpty()
    itemId: string;

    @IsNumber()
    @IsNotEmpty()
    ratePerUnit: number;
}
