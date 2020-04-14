import { ApiModelProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileInfoVm {

    @ApiModelProperty()
    @Expose()
    length: number;

    @ApiModelProperty()
    @Expose()
    chunkSize: number;

    @ApiModelProperty()
    @Expose()
    filename: string;    

    @ApiModelProperty()
    @Expose()
    md5: string;

    @ApiModelProperty()
    @Expose()
    contentType: string;
}