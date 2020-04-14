import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { SuggestionStatus } from '../suggestion-level.enum';

export class SuggestionParams {
    @ApiModelProperty() owner: string;
    @ApiModelProperty() owner_process: string;
    @ApiModelProperty() applied_process: string;
    @ApiModelProperty() area: string;
    @ApiModelProperty() machine: string;
    @ApiModelProperty() categories: string[];
    @ApiModelProperty() component: string;
    @ApiModelProperty() suggestion_name: string;
    @ApiModelProperty() description: string;
    @ApiModelProperty() benefit: string;
    @ApiModelProperty() attachments: string[];
}
