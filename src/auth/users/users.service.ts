import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly dbService: DatabaseService) {}

    async create(payload: Prisma.UserCreateInput) {
        const exists = await this.dbService.user.findFirst({
            where: {
                email: payload.email
            }
        });
        
        if(exists) {
            throw new BadRequestException('Email address already registered.');
        }

        payload.password = await this.encryptPassword(payload.password, 10);

        return this.dbService.user.create({
          data: payload,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });
    }

    private async encryptPassword(password, salt) {
        return await bcrypt.hash(password, salt);
    }
}
