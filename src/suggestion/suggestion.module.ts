import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Suggestion } from './models/suggestion.model';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Suggestion.modelName, schema: Suggestion.model.schema }]), HttpModule],
    controllers: [SuggestionController],
    providers: [SuggestionService],
})
export class SuggestionModule {}
