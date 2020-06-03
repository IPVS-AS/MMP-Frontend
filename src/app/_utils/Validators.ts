import {Directive, Input} from '@angular/core';
import {FormControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {Closure, Interval} from '../_models/model';

@Directive({
  selector: '[appInInterval]',
  providers: [{provide: NG_VALIDATORS, useExisting: CustomIntervalDirective, multi: true}]
})
export class CustomIntervalDirective implements Validator {
  @Input('appInInterval') interval: Interval;

  validate(c: FormControl): { [key: string]: any } {
    if (this.interval === null || !c.value) {
      return null;
    }

    const value = c.value;
    const min = this.interval.startRange;
    const max = this.interval.endRange;
    switch (this.interval.closure) {
      case Closure.OPENOPEN:
        return (min < value && value < max) ? null : {'appInInterval': false};
      case Closure.OPENCLOSED:
        return (min < value && value <= max) ? null : {'appInInterval': false};
      case Closure.CLOSEDOPEN:
        return (min <= value && value < max) ? null : {'appInInterval': false};
      case Closure.CLOSEDCLOSED:
        return (min <= value && value <= max) ? null : {'appInInterval': false};
      default:
        return null;
    }
  }
}
