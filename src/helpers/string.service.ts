import { Injectable } from '@nestjs/common';

@Injectable()
export class StringService {
  escapeSQLCharacters(myString: string): string {
    if (!myString) return myString;
    let returnString = myString;
    returnString = returnString.replace(/_/g, '\\_');
    returnString = returnString.replace(/%/g, '\\%');
    return returnString;
  }

  stringToLowerCase = (string: string): string => {
    return string.toLowerCase();
  };
}
