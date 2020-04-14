import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { SuggestionStatus } from '../suggestion-level.enum';

export class ApproveParams {

    @ApiModelProperty() cml: number;
    @ApiModelProperty({required: false}) implementer: string;
    @ApiModelProperty({required: false}) comment: string;
    @ApiModelPropertyOptional({ enum: SuggestionStatus, example: SuggestionStatus.Pending })
    status?: SuggestionStatus;    
    @ApiModelProperty({required: false}) isCompleted: boolean;
    @ApiModelProperty() id: string;
    @ApiModelProperty({required: false}) score_submit: number;
    @ApiModelProperty({required: false}) score_approved: number;
    @ApiModelProperty({required: false}) score_cml4: number; 
    @ApiModelProperty({required: false}) score_implemented: number;
    @ApiModelProperty({required: false}) score_byOwner: number;
}
