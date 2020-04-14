import { InstanceType, ModelType, prop } from 'typegoose';
import { BaseModel, schemaOptions } from '../../shared/base.model';
import { SuggestionStatus } from './suggestion-level.enum';
import { Expose } from 'class-transformer';

export class Suggestion extends BaseModel<Suggestion> {
    @prop({ required: [true, 'Content is required'] })
    @Expose()
    owner: string;

    @prop({ required: [true, 'Owner process is required'] })
    @Expose()
    owner_process: string;

    @prop({ required: [true, 'The process to be applied is required'] })
    @Expose()
    applied_process: string;

    @prop({ required: [true, 'Areas is required'] })
    @Expose()
    area: string;

    @prop({ required: [true, 'Machines is required'] })
    @Expose()
    machine: string;

    @prop({ required: [true, 'Discription is required'] })
    @Expose()
    categories: string[];

    @prop({ required: [true, 'Discription is required'] })
    @Expose()
    component: string;

    @prop({ required: [true, 'Discription is required'] })
    @Expose()
    suggestion_name: string;

    @prop({ required: [true, 'Discription is required'] })
    @Expose()
    description: string;

    @prop({ required: [true, 'Benefit is required'] })
    @Expose()
    benefit: string;

    @prop()
    @Expose()
    attachments: string[];

    @prop()
    @Expose()
    approver: string;

    @prop()
    @Expose()
    cml: number;

    @prop()
    @Expose()
    comment: string;

    @prop()
    @Expose()
    submitTime: string;

    @prop()
    @Expose()
    approvedTime: string;

    @prop()
    @Expose()
    implementer: string;

    @prop()
    @Expose()
    implementedTime: string;

    @prop({ enum: SuggestionStatus, default: SuggestionStatus.Pending })
    @Expose()
    status: SuggestionStatus;
    @prop({ default: false })
    @Expose()
    isCompleted: boolean;   

    @prop({ default: 5 })
    @Expose()
    score_submit: number;

    @prop({ default: 0 })
    @Expose()
    score_approved: number;

    @prop({ default: 0 })
    @Expose()
    score_cml4: number; 

    @prop({ default: 0 })
    @Expose()
    score_implemented: number;

    @prop({ default: 0 })
    @Expose()
    score_byOwner: number;

    static get model(): ModelType<Suggestion> {
        return new Suggestion().getModelForClass(Suggestion, { schemaOptions });
    }

    static get modelName(): string {
        return this.model.modelName;
    }

    static createModel(): InstanceType<Suggestion> {
        return new this.model();
    }
}
