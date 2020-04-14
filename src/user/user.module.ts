import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.modelName, schema: User.model.schema }]), HttpModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
