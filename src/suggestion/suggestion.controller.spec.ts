import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionController } from './suggestion.controller';

describe('Suggestion Controller', () => {
    let module: TestingModule;
    beforeAll(async () => {
        module = await Test.createTestingModule({
            controllers: [SuggestionController],
        }).compile();
    });
    it('should be defined', () => {
        const controller: SuggestionController = module.get<SuggestionController>(SuggestionController);
        expect(controller).toBeDefined();
    });
});
