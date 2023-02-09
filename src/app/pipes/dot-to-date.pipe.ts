import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dotToDate' })
export class DotToDatePipe implements PipeTransform {
  transform(stringDate: string) {
    // convert the date-times here (temporary fix)
    if (stringDate !== null && typeof stringDate !== 'undefined') {
      const startParts = stringDate.split('.');
      const DateTime = new Date(
        Number(startParts[0]), // year
        Number(startParts[1]) - 1, // month
        Number(startParts[2]), // day
        Number(startParts[3]), // hour
        Number(startParts[4]), // minute
        Number(startParts[5]) // second
      );
      return DateTime;
    } else {
      return stringDate;
    }
  }
}
