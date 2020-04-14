import { Body, Controller, HttpException, HttpStatus, Post, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiUseTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiException } from '../shared/api-exception.model';
import { GetOperationId } from '../shared/utilities/get-operation-id.helper';
import { User } from './models/user.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { LoginVm } from './models/view-models/login-vm.model';
import { RegisterVm } from './models/view-models/register-vm.model';
import { UserVm } from './models/view-models/user-vm.model';
import { UserService } from './user.service';
import { LoginwithMicrosoftVm } from './models/view-models/loginwithmicrosoft-vm.model';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from './models/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';

@Controller('user')
@ApiUseTags(User.modelName)
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Post('register')
    @ApiCreatedResponse({ type: UserVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(User.modelName, 'Register'))
    async register(@Body() vm: RegisterVm): Promise<UserVm> {
        const { email, password } = vm;

        if (!email) {
            throw new HttpException('Username is required', HttpStatus.BAD_REQUEST);
        }

        if (!password) {
            throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
        }

        let exist;
        try {
            exist = await this._userService.findOne({ email });
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (exist) {
            throw new HttpException(`${email} exists`, HttpStatus.BAD_REQUEST);
        }

        const newUser = await this._userService.register(vm);
        console.log(newUser);
        return this._userService.map(newUser, User, UserVm);
    }

    @Post('login')
    @ApiCreatedResponse({ type: LoginResponseVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(User.modelName, 'Login'))
    async login(@Body() vm: LoginVm): Promise<LoginResponseVm> {
        const fields = Object.keys(vm);
        fields.forEach(field => {
            if (!vm[field]) {
                throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
            }
        });

        return this._userService.login(vm);
    }

    @Post('loginwithmicrosoft')
    @ApiCreatedResponse({ type: LoginResponseVm })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(GetOperationId(User.modelName, 'LoginWithMicrosoft'))
    async loginwithmicrosoft(@Body() vm: LoginwithMicrosoftVm): Promise<LoginResponseVm> {
        const fields = Object.keys(vm);
        fields.forEach(field => {
            if (!vm[field]) {
                throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
            }
        });

        return this._userService.loginwihtmicrosoft(vm);
    }

    @Get('isloggedin')
    @ApiBearerAuth()
    @Roles(UserRole.Admin, UserRole.Approver, UserRole.User)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiOkResponse({ type: UserVm})
    @ApiBadRequestResponse({ type: ApiException })
    async isloggedin(@Req() req){
        if(!req.user){
            throw new HttpException('User not logged in', HttpStatus.BAD_REQUEST);
        }
        else{
            return this._userService.findOne({ email: req.user.email })
        }
    }
}
