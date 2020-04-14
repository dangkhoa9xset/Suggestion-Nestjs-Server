import { ApiModelProperty } from '@nestjs/swagger';

export class AttachmentResponseVm {
    @ApiModelProperty() message: string;
    @ApiModelProperty() attchID: string;
}