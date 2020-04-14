import { ApiModelProperty } from '@nestjs/swagger';
import { FileInfoVm } from './file-info-vm.model';

export class FileResponseVm {
    @ApiModelProperty() message: string;

    @ApiModelProperty({ type: FileInfoVm })
    file: FileInfoVm;
}