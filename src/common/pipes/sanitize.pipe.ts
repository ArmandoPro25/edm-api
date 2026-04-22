import { PipeTransform, Injectable } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return xss(value);
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        if (typeof value[key] === 'string') {
          value[key] = xss(value[key]);
        }
      });
    }
    return value;
  }
}