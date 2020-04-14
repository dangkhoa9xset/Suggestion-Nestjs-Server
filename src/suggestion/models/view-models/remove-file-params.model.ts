import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { SuggestionStatus } from '../suggestion-level.enum';

export class RemoveFileParams {

    @ApiModelProperty({required: true}) id: string;
    @ApiModelProperty({required: true}) attachID: string;
}
