import { ApiModelProperty } from '@nestjs/swagger';

export class TopScoreResponseVm {
    @ApiModelProperty() email: string;

    @ApiModelProperty() totalScore: number;

    @ApiModelProperty() count: number;

}