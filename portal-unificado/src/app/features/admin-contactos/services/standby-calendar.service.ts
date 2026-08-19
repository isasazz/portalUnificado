import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StandbyCalendarService {

  isStandbyRangeValid(
    startDate: Date,
    endDate: Date
  ): boolean {

    const startDay =
      startDate.getDay();

    const endDay =
      endDate.getDay();

    const diffDays =
      Math.floor(
        (
          endDate.getTime() -
          startDate.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      );

    return (
      startDay === 5 &&
      endDay === 4 &&
      diffDays === 6
    );

  }

}