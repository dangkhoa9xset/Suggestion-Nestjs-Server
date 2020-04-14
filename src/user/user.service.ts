import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    HttpService,
    BadGatewayException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcryptjs';
import { ModelType } from 'typegoose';
import { AuthService } from '../shared/auth/auth.service';
import { JwtPayload } from '../shared/auth/jwt-payload.model';
import { BaseService } from '../shared/base.service';
import { MapperService } from '../shared/mapper/mapper.service';
import { User } from './models/user.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { LoginVm } from './models/view-models/login-vm.model';
import { RegisterVm } from './models/view-models/register-vm.model';
import { LoginwithMicrosoftVm } from './models/view-models/loginwithmicrosoft-vm.model';
import { UserVm } from './models/view-models/user-vm.model';
import { UserRole } from './models/user-role.enum';

export interface Response<T> {
    data: T;
}

@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @InjectModel(User.modelName) private readonly _userModel: ModelType<User>,
        private readonly _mapperService: MapperService,
        @Inject(forwardRef(() => AuthService))
        readonly _authService: AuthService,
        private readonly httpService: HttpService,
    ) {
        super();
        this._model = _userModel;
        this._mapper = _mapperService.mapper;
    }

    async register(vm: RegisterVm) {
        const { email, password, firstName, lastName } = vm;

        const newUser = User.createModel();
        newUser.email = email.trim().toLowerCase();
        newUser.firstName = firstName;
        newUser.lastName = lastName;

        const salt = await genSalt(10);
        newUser.password = await hash(password, salt);

        try {
            const result = await this.create(newUser);
            return result.toJSON() as User;
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(vm: LoginVm): Promise<LoginResponseVm> {
        const { email, password } = vm;

        const user = await this.findOne({ email });

        if (!user) {
            throw new HttpException('Invalid crendentials', HttpStatus.NOT_FOUND);
        }

        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            throw new HttpException('Invalid crendentials', HttpStatus.BAD_REQUEST);
        }

        const payload: JwtPayload = {
            email: user.email,
            role: user.role,
            jobTitle: user.jobTitle
            
        };

        const token = await this._authService.signPayload(payload);

        //console.log(user);

        const userVm: UserVm = await this.map(user.toJSON(), User, UserVm);
        return {
            token,
            user: userVm,
        };
    }

    async loginwihtmicrosoft(vm: LoginwithMicrosoftVm): Promise<LoginResponseVm> {
        const { accessToken } = vm;

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            Authorization: `Bearer ${accessToken}`,
        };

        const result = await this.httpService
            .get('https://graph.microsoft.com/v1.0/me', {
                headers: headersRequest,
            })
            .toPromise()
            .catch(error => {
                if (error.response) {
                    throw new HttpException(HttpStatus[error.response.status], error.response.status);
                } else {
                    const httpCode = 503
                    throw new HttpException(HttpStatus[httpCode], httpCode);
                }
            })
            .then(response => {
                return response.data
            });

        const newUser = User.createModel()
        newUser.email = result.userPrincipalName.trim().toLowerCase()
        newUser.firstName = result.surname
        newUser.lastName = result.givenName
        newUser.jobTitle = result.jobTitle
        newUser.mail = result.mail
        const salt = await genSalt(10)
        newUser.password = await hash('passwordisnull', salt)

        const exits = await this.findOne({ email: newUser.email })

        if (result.jobTitle.indexOf('Manager') > 0) {
            newUser.role = UserRole.Approver
        } else {
            newUser.role = UserRole.User
        }

        if (!exits) {
            await this.create(newUser);
        } else {
            await exits.updateOne({ role: newUser.role });
        }

        const user = await this.findOne({ email: newUser.email });
        const payload: JwtPayload = {
            email: user.email,
            role: user.role,
            jobTitle: user.jobTitle
        };

        const token = await this._authService.signPayload(payload);

        //console.log(user);
        const userVm: UserVm = await this.map(user.toJSON(), User, UserVm);
        return {
            token,
            user: userVm,
        };
    }
}
