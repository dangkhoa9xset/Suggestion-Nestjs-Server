import { InstanceType, ModelType, prop } from 'typegoose';
import { BaseModel, schemaOptions } from '../../shared/base.model';
import { UserRole } from './user-role.enum';
import { Expose } from 'class-transformer';

export class MicrosoftUser extends BaseModel<MicrosoftUser> {
    @prop()
    @Expose()
    userPrincipalName: string;

    @prop()
    @Expose()
    jobTitle: string;

    @prop()
    @Expose()
    givenName: string;

    @prop()
    @Expose()
    surename: string;

    static get model(): ModelType<MicrosoftUser> {
        return new MicrosoftUser().getModelForClass(MicrosoftUser, { schemaOptions });
    }

    static get modelName(): string {
        return this.model.modelName;
    }

    static createModel(): InstanceType<MicrosoftUser> {
        return new this.model();
    }
}
