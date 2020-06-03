import {Subscription} from 'rxjs';

export class TimeoutComponent {
  timeout = false;
  TIMEOUT_TIME = 3000;
  number;

  waitForTimeOut(subscription: Subscription) {
    this.number = setTimeout(() => {
      subscription.unsubscribe();
      this.timeout = true;
    }, this.TIMEOUT_TIME);
  }

  cancelTimeout() {
    if (this.number) {
      this.timeout = false;
      clearTimeout(this.number);
    }
  }
}
