import { Injectable } from '@nestjs/common';
import { AutoMapper, Mapper, Configuration } from 'automapper-nartc';
import { User } from '../../user/models/user.model';
import { UserVm } from '../../user/models/view-models/user-vm.model';
import { Suggestion } from '../../suggestion/models/suggestion.model';
import { SuggestionVm } from '../../suggestion/models/view-models/suggestion-vm.model';

@Injectable()
export class MapperService {
    mapper: AutoMapper;

    constructor() {
        this.mapper = Mapper;
        this.initializeMapper();
    }

    private initializeMapper(): void {
        this.mapper.initialize(MapperService.configure);
    }

    private static configure(config: Configuration): void {
        config.createMap(User, UserVm).forMember('fullName', opts => opts.mapFrom(s => s.fullName));
        config.createMap(Suggestion, SuggestionVm);
    }
}
