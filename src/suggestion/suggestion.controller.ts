import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Req,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    ExecutionContext,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiImplicitQuery,
    ApiOkResponse,
    ApiOperation,
    ApiUseTags,
} from '@nestjs/swagger';
import { isArray, map } from 'lodash';
import { ApiException } from '../shared/api-exception.model';
import { ToBooleanPipe } from '../shared/pipes/to-boolean.pipe';
import { GetOperationId } from '../shared/utilities/get-operation-id.helper';
import { SuggestionStatus } from './models/suggestion-level.enum';
import { Suggestion } from './models/suggestion.model';
import { SuggestionParams } from './models/view-models/suggestion-params.model';
import { SuggestionVm } from './models/view-models/suggestion-vm.model';
import { AttachmentResponseVm } from './models/view-models/attachment-response-vm.model';
import { RemoveFileParams } from './models/view-models/remove-file-params.model'
import { SuggestionService } from './suggestion.service';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../user/models/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApproveParams } from './models/view-models/approve-params.model'

@Controller('suggestion')
@ApiUseTags(Suggestion.modelName)
@ApiBearerAuth()
export class SuggestionController {
    constructor(private readonly _suggestionService: SuggestionService) {}

    @Post()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiCreatedResponse({ type: SuggestionVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'Create'))
    async create(@Body() params: SuggestionParams): Promise<SuggestionVm> {
        try {
            const newSuggestion = await this._suggestionService.createSuggestion(params);
            return newSuggestion;
            //return this._suggestionService.map(newSuggestion, Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm, isArray: true })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'GetAll'))
    @ApiImplicitQuery({ name: 'status', enum: EnumToArray(SuggestionStatus), required: false, isArray: true })
    @ApiImplicitQuery({ name: 'isCompleted', required: false })
    async get(
        @Query('status') status?: SuggestionStatus,
        @Query('isCompleted', new ToBooleanPipe())
        isCompleted?: boolean,
    ): Promise<SuggestionVm[]> {
        let filter = {};
        if (status) {
            filter['status'] = { $in: isArray(status) ? [...status] : [status] };
        }

        if (isCompleted !== null) {
            if (filter['status']) {
                filter = { $and: [{ status: filter['status'] }, { isCompleted }] }; 
            } else {
                filter['isCompleted'] = isCompleted;
            }
        }

        try {
            const suggestions = await this._suggestionService.findAll(filter);

            return suggestions;
            //return this._suggestionService.mapArray(map(suggestions, suggestion => suggestion.toJSON()), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('mysuggestions')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm, isArray: true })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'GetbyEmail'))
    async getbyemail(@Req() req,
    ): Promise<SuggestionVm[]> {
        let filter = {};
        
        if(req.user !== null){
            filter['owner'] = req.user.email;
        }    
        else{
            throw new HttpException('Email is null', HttpStatus.BAD_REQUEST);
        }

        try {
            const suggestions = await this._suggestionService.findAll(filter);
            
            return suggestions;
            //return this._suggestionService.mapArray(map(suggestions, suggestion => suggestion.toJSON()), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('topscore')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBadRequestResponse({ type: ApiException })
    async countSum() {
        let filter = [
            {
                $group:
                {
                    _id: "$owner",
                    totalScore: { $sum: { $add: [ "$score_submit", "$score_approved", "$score_byOwner", "$score_cml4", "$score_implemented" ] } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort:
                {
                    totalScore: -1
                }
            }, 
            {
                $limit: 5
            }
        ]
        try {
            
            var suggestion = await (await this._suggestionService.countSum(filter));
            
            return suggestion
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Get('stats')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'GetStats'))
    @ApiImplicitQuery({ name: 'status', enum: EnumToArray(SuggestionStatus), required: false, isArray: true })
    async getstats(
        @Query('status') status?: SuggestionStatus,
    ){
        let filter = {};
        //console.log(status)
        if (status) {
            filter = [
                { $match : { status : status } },
                {
                    $group:
                    {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ]
        }

        try {
            const suggestions = await this._suggestionService.countSum(filter);

            return suggestions;
            //return this._suggestionService.mapArray(map(suggestions, suggestion => suggestion.toJSON()), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('process')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm, isArray: true })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'GetbyProcess'))
    @ApiImplicitQuery({ name: 'status', enum: EnumToArray(SuggestionStatus), required: false, isArray: true })
    async getbyprocess(@Req() req, @Query('status') status?: SuggestionStatus,
    ): Promise<SuggestionVm[]> {
        let filter = {};
        if (status) {
            filter['status'] = { $in: isArray(status) ? [...status] : [status] };
        }
        if(req.user !== null){
            var process = req.user.jobTitle.split(' ')
            if(process[0] === 'Prepress'){
                //filter = { $or: [{ applied_process: process[0] }, { applied_process: 'Printing' }] }; 
                if(filter['status']){
                    filter = { $and: [{ status: filter['status'] }, { $or: [{ applied_process: process[0] }, { applied_process: 'Printing' }] }] };
                }
                else{
                    filter = { $or: [{ applied_process: process[0] }, { applied_process: 'Printing' }] }
                }
            }
            else{
                if(filter['status']){
                    filter = { $and: [{ status: filter['status'] }, { applied_process: process[0]} ] }; 
                }
                else{
                    filter['applied_process'] = process[0];
                }
            }
        }    
        else{
            throw new HttpException('Email is null', HttpStatus.BAD_REQUEST);
        }

        try {
            const suggestions = await this._suggestionService.findAll(filter);

            return suggestions;
            //return this._suggestionService.mapArray(map(suggestions, suggestion => suggestion.toJSON()), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Get('id/:id')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'GetbyID'))
    async getbyid(@Param('id') id: string): Promise<SuggestionVm> {
        try {
            const suggestion = await this._suggestionService.findById(id);
            return suggestion
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }


    @Put()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'Update'))
    async update(@Req() req,@Body() vm: SuggestionVm): Promise<SuggestionVm> {
        const { id, owner, owner_process, applied_process, area, machine, categories, component, suggestion_name, description, benefit, attachments, isCompleted, status } = vm;

        if (!vm || !id) {
            throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
        }        

        // if (req.headers && req.headers.authorization) {
        //     var authorization = req.headers.authorization.split(' ')
        // }
        var user = req.user
        // console.log(req.user)
        // interface MyObj {
        //     email: string;
        //     role: string;
        //     jobTitle: string;
        //     iat: number;
        //     exp: number;
        // }
        // let user: MyObj = JWT(authorization[1]);
        
        const exist = await this._suggestionService.findById(id);

        if (!exist) {
            throw new HttpException(`${id} Not found`, HttpStatus.NOT_FOUND);
        }        

        if(user.role !== UserRole.Admin){   
            if(user.email !== exist.owner){
                if(user.role !== UserRole.Approver){
                    throw new HttpException('You do not have permission!', HttpStatus.NOT_FOUND);
                }
                else{
                    if(user.jobTitle.indexOf(exist.applied_process) < 0){
                        throw new HttpException(`You do not have edit permissions because of this suggestion is of ${exist.owner_process}!`, HttpStatus.NOT_FOUND);
                    }
                    if (exist.isCompleted) {
                        throw new HttpException('Already completed', HttpStatus.BAD_REQUEST);
                    }
                }    
            }           
            if (exist.status !== SuggestionStatus.Pending) {
                throw new HttpException('You cannot edit because suggestion is in the process of execution', HttpStatus.BAD_REQUEST);
            }     
        }

        exist.owner = owner;
        exist.owner_process = owner_process;
        exist.applied_process = applied_process;
        exist.area = area;
        exist.machine = machine;
        exist.categories = categories;
        exist.component = component;
        exist.suggestion_name = suggestion_name;
        exist.description = description;
        exist.benefit = benefit;
        exist.attachments = attachments;
        exist.isCompleted = isCompleted;
        exist.status = status;

        try {
            const updated = await this._suggestionService.update(id, exist);
            return updated;
            //return this._suggestionService.map(updated.toJSON(), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('approve')
    @Roles(UserRole.Admin, UserRole.Approver)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'approve'))
    async approve(@Req() req,@Body() vm: ApproveParams): Promise<SuggestionVm> {
    
        const {id, cml, comment, status, implementer, score_approved, score_cml4, score_implemented, score_byOwner } = vm
        const exist = await this._suggestionService.findById(id);

        if (!exist) {
            throw new HttpException(`${id} Not found`, HttpStatus.NOT_FOUND);
        }

        exist.cml = cml
        exist.comment = comment
        exist.status = status
        exist.implementer = implementer
        exist.approver = req.user.email

        if(status === SuggestionStatus.Implemented){
            exist.isCompleted = true
        }
        else{
            exist.isCompleted = false
        }

        var localTime = function() {
            var d = new Date()
            var offset = (new Date().getTimezoneOffset() / 60) * -1
            var n = new Date(d.getTime() + offset)
            var formatted_date = n.getDate() + '/' +
                                (n.getMonth() + 1) +
                                '/' + n.getFullYear() + ' ' +
                                n.getHours() + ':' + 
                                n.getMinutes() + ':' +
                                n.getSeconds()
            return formatted_date
        }
        
        if(status !== SuggestionStatus.Pending){
            if(status === SuggestionStatus.Approved){
                exist.approvedTime = localTime()
                exist.score_approved = 50
                if(cml >= 4 ){
                    exist.score_cml4 = 50
                }
                else{
                    exist.score_cml4 = 0
                }
            }
            else if(status === SuggestionStatus.Implemented){
                exist.implementedTime = localTime()
                exist.score_implemented = 100
                if(implementer === 'Yes'){
                    exist.score_byOwner = 25
                }
                else{
                    exist.score_byOwner = 0
                }
            }
        }
        else{
            exist.cml = null
            exist.implementer = null
            exist.approvedTime = null
            exist.implementedTime = null
            exist.score_approved = 0
            exist.score_cml4 = 0
            exist.score_implemented = 0
            exist.score_byOwner = 0
        }

        try {
            const updated = await this._suggestionService.update(id, exist);
            return updated;
            //return this._suggestionService.map(updated.toJSON(), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('dltattch')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: AttachmentResponseVm })
    @ApiBadRequestResponse({ type: ApiException })
    async dltattch(@Req() req,@Body() vm:RemoveFileParams): Promise<AttachmentResponseVm> {
    
        const { id, attachID} = vm
        const exist = await this._suggestionService.findById(id);

        if (!exist) {
            throw new HttpException(`${id} Not found`, HttpStatus.NOT_FOUND);
        }
        let filter = {};
        filter = {$pull: { attachments: attachID }}
        exist.approver = req.user.email
        try {
            const updated = await this._suggestionService.clearArray(id, filter);
            return {
                message: 'File has been removed',
                attchID: attachID
            };
            //return this._suggestionService.map(updated.toJSON(), Suggestion, SuggestionVm);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('id/:id')
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: SuggestionVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(Suggestion.modelName, 'Delete'))
    async delete(@Req() req, @Param('id') id: string): Promise<SuggestionVm> {
        var user = req.user
        
        try {
            const exist = await this._suggestionService.findById(id);

            if (exist.isCompleted) {
                throw new HttpException('Can not delete because suggestion is already completed', HttpStatus.BAD_REQUEST);
            }

            if(user.role !== UserRole.Admin){   
                if(user.email !== exist.owner){
                    if(user.role !== UserRole.Approver){
                        throw new HttpException('You do not have permission!', HttpStatus.NOT_FOUND);
                    }
                    else{
                        if(user.jobTitle.indexOf(exist.applied_process) < 0){
                            throw new HttpException(`You do not have delete permissions because of this suggestion is of ${exist.owner_process}!`, HttpStatus.NOT_FOUND);
                        }
                        if (exist.isCompleted) {
                            throw new HttpException('Can not delete because suggestion is already completed', HttpStatus.BAD_REQUEST);
                        }
                    }    
                }           
                if (exist.status !== SuggestionStatus.Pending) {
                    throw new HttpException('Can not delete because suggestion is in the process of execution!', HttpStatus.BAD_REQUEST);
                }     
            }

            const deleted = await this._suggestionService.delete(id);
            return deleted;
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}

export function EnumToArray(enumVariable: any): string[] {
    return Object.keys(enumVariable).map(k => enumVariable[k]);
}
