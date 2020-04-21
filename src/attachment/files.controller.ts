import { Post, Get, Param, Res, Controller, UseInterceptors, UseGuards, UploadedFiles, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { ApiCreatedResponse, ApiConsumes, ApiImplicitFile, ApiBadRequestResponse, ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiException } from '../shared/api-exception.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FileResponseVm } from './view-models/file-response-vm.model'
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '../user/models/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
@Controller('/attachment/files')
@ApiUseTags('Attachments')
@Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
export class FilesController {
    constructor(private filesService: FilesService){}
    @Post('')
    @ApiBearerAuth()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'files', required: true, description: 'Attachment Files'})
    @UseInterceptors(FilesInterceptor('files'))
    upload(@UploadedFiles() files) {
        const response = [];
        files.forEach(file => {
            const fileReponse = {
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                id: file.id,
                filename: file.filename,
                metadata: file.metadata,
                bucketName: file.bucketName,
                chunkSize: file.chunkSize,
                size: file.size,
                md5: file.md5,
                uploadDate: file.uploadDate,
                contentType: file.contentType,
            };
            response.push(fileReponse);
        });
        return response;
    }

    @Get('info/:id')
    @ApiBearerAuth()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBadRequestResponse({ type: ApiException })
    async getFileInfo(@Param('id') id: string): Promise<FileResponseVm> {        
        const file = await this.filesService.findInfo(id)
        const filestream = await this.filesService.readStream(id)
        if(!filestream){
            throw new HttpException('An error occurred while retrieving file info', HttpStatus.EXPECTATION_FAILED)
        }
        return {
            message: 'File has been detected',
            file: file
        }
    }

    @Get(':id')
    @ApiBearerAuth()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBadRequestResponse({ type: ApiException })
    async getFile(@Param('id') id: string, @Res() res) {        
        const file = await this.filesService.findInfo(id)
        const filestream = await this.filesService.readStream(id)
        if(!filestream){
            throw new HttpException('An error occurred while retrieving file', HttpStatus.EXPECTATION_FAILED)
        }
        res.header('Content-Type', file.contentType);
        return filestream.pipe(res)
    }

    @Get('download/:id')
    @ApiBadRequestResponse({ type: ApiException })
    async downloadFile(@Param('id') id: string, @Res() res) {
        const file = await this.filesService.findInfo(id)        
        const filestream = await this.filesService.readStream(id)
        if(!filestream){
            throw new HttpException('An error occurred while retrieving file', HttpStatus.EXPECTATION_FAILED)
        } 
        res.header('Content-Type', file.contentType);
        res.header('Content-Disposition', 'attachment; filename=' + file.filename);
        return filestream.pipe(res) 
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBadRequestResponse({ type: ApiException })
    @ApiCreatedResponse({ type: FileResponseVm })
    async deleteFile(@Param('id') id: string): Promise<FileResponseVm> {
        const file = await this.filesService.findInfo(id)
        const filestream = await this.filesService.deleteFile(id)
        if(!filestream){
            throw new HttpException('An error occurred during file deletion', HttpStatus.EXPECTATION_FAILED)
        }        
        return {
            message: 'File has been deleted',
            file: file
        }
    }
}
