import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ToStringPipe implements PipeTransform {
    transform(value: any, { type, metatype }: ArgumentMetadata) {
        if (type === 'query' && metatype === String) {
            return value ? value : null;
        }

        return value;
    }
}
