import { ApiModelProperty } from '@nestjs/swagger';


export class LoginVm {
    @ApiModelProperty({ required: true, minLength: 6 })
    email: string;

    @ApiModelProperty({ required: true, minLength: 6, type: String, format: 'password' })
    password: string;
}
