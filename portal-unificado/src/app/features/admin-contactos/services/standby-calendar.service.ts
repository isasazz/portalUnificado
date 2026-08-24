import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StandbyCalendarService {

  isStandbyRangeValid(
    startDate: Date,
    endDate: Date
  ): boolean {

    const diffDays =
      Math.floor(
        (
          endDate.getTime() -
          startDate.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      );

    return diffDays === 6;

  }

}