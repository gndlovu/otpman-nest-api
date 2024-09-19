import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): [string, string] {
    return ['Hello', 'World!'];
  }
}
