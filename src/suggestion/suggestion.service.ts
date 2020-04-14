import { HttpService, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelType } from 'typegoose';
import { BaseService } from '../shared/base.service';
import { MapperService } from '../shared/mapper/mapper.service';
import { Suggestion } from './models/suggestion.model';
import { SuggestionParams } from './models/view-models/suggestion-params.model';


@Injectable()
export class SuggestionService extends BaseService<Suggestion> {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(Suggestion.modelName) private readonly _suggestionModel: ModelType<Suggestion>,
        private readonly _mapperService: MapperService,
    ) {
        super();
        this._model = _suggestionModel;
        this._mapper = _mapperService.mapper;
    }

    async createSuggestion(params: SuggestionParams): Promise<Suggestion> {
        const { owner, owner_process, applied_process, area, machine, categories, component, suggestion_name, description, benefit, attachments } = params;

        const newSuggestion = Suggestion.createModel();

        newSuggestion.owner = owner;
        newSuggestion.owner_process = owner_process;
        newSuggestion.applied_process = applied_process;
        newSuggestion.area = area;
        newSuggestion.machine = machine;
        newSuggestion.categories = categories;
        newSuggestion.component = component;
        newSuggestion.suggestion_name = suggestion_name;
        newSuggestion.description = description;
        newSuggestion.benefit = benefit;
        newSuggestion.attachments = attachments;

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

        newSuggestion.submitTime = localTime()

        

        try {
            const result = await this.create(newSuggestion);
            
            return result.toJSON() as Suggestion;
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}
