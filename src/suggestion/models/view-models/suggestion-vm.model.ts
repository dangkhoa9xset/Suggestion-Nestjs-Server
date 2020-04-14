import { ApiModelProperty } from '@nestjs/swagger';
import { BaseModelVm } from '../../../shared/base.model';
import { SuggestionStatus } from '../suggestion-level.enum';
import { Expose } from 'class-transformer';

export class SuggestionVm extends BaseModelVm {
    @ApiModelProperty()
    @Expose()
    owner: string;

    @ApiModelProperty()
    @Expose()
    owner_process: string;

    @ApiModelProperty()
    @Expose()
    applied_process: string;

    @ApiModelProperty()
    @Expose()
    area: string;

    @ApiModelProperty()
    @Expose()
    machine: string;

    @ApiModelProperty()
    @Expose()
    categories: string[];

    @ApiModelProperty()
    @Expose()
    component: string;

    @ApiModelProperty()
    @Expose()
    suggestion_name: string;

    @ApiModelProperty()
    @Expose()
    description: string;

    @ApiModelProperty()
    @Expose()
    benefit: string;

    @ApiModelProperty({ enum: SuggestionStatus })
    @Expose()
    status: SuggestionStatus;

    @ApiModelProperty({ example: 'false' })
    @Expose()
    isCompleted: boolean;

    @ApiModelProperty()
    @Expose()
    attachments: string[];
}
