import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt } from 'class-validator';

export class UpdateEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del reporte',
    example: 2,
    enum: [1, 2, 3],
  })
  @IsInt()
  @IsIn([1, 2, 3])
  idEstado: number | undefined;
}