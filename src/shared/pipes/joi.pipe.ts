import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
    constructor(private schema: ObjectSchema) {}

    transform(value: any) {
        const { error } = this.schema.validate(value);
        if (error) {
            const errorMessage = error.details[0].message.replace(/"/g, '');
            throw new BadRequestException(errorMessage);
        }

        return value;
    }
}
