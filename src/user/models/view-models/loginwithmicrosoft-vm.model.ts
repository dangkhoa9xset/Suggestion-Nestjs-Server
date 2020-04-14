import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class LoginwithMicrosoftVm {
    @ApiModelProperty()
    accessToken: string;
}
