import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {User} from '../../../_models/user';

import {UserService} from '../../../_services/user.service';
import {Location} from '@angular/common';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {TimeoutComponent} from '../../../timeout/timeout.component';


@Component({
  selector: 'app-add-user',
  templateUrl: './edit-user.component.html'
})
export class EditUserComponent extends TimeoutComponent implements OnInit {

  user: User;
  userID: string;
  USER_ENTITY = this.toastManagerService.USER_ENTITY;
  private UPDATE_OPERATION = this.toastManagerService.UPDATE_OPERATION;

  userIDExists: boolean;

  constructor(
    private userService: UserService,
    protected location: Location,
    private toastManagerService: ToastManagerService,
    private route: ActivatedRoute,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.userIDExists = false;
    this.userID = this.route.snapshot.paramMap.get('userId');
    const subscription = this.userService.getUserById(this.userID).subscribe(user => {this.user = user;
      if (this.user !== null ) {
        this.cancelTimeout();
        this.userIDExists = true;
      }
    });
    this.waitForTimeOut(subscription);
  }

  cancel() {
    this.location.back();
  }

  submit() {
    this.userService.updateUser(this.user).subscribe(user => {
      this.user = user;
      this.router.navigate(['/users']);
    }, e => {
      console.log(e.valueOf());
      this.toastManagerService.openStandardError(this.USER_ENTITY, this.UPDATE_OPERATION);
    }, () => {
      this.toastManagerService.openStandardSuccess(this.USER_ENTITY, this.UPDATE_OPERATION);
    });
  }
}
