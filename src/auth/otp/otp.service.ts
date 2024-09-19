import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OtpService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createOtpDto: Prisma.OtpCreateInput) {
    return this.dbService.otp.create({
      data: createOtpDto
    })
  }

  findAll() {
    return `This action returns all otp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} otp`;
  }

  update(id: number, updateOtpDto: Prisma.OtpUpdateInput) {
    return `This action updates a #${id} otp`;
  }

  remove(id: number) {
    return `This action removes a #${id} otp`;
  }
}
