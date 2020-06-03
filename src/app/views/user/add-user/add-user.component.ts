import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {User} from '../../../_models/user';

import {UserService} from '../../../_services/user.service';
import {Location} from '@angular/common';
import {ToastManagerService} from '../../../_services/toast-manager.service';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html'
})
export class AddUserComponent implements OnInit {
  user: User;
  USER_ENTITY = this.toastManagerService.USER_ENTITY;
  private SAVE_OPERATION = this.toastManagerService.SAVE_OPERATION;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private location: Location,
    private toastManagerService: ToastManagerService,
    private router: Router) {

  }

  ngOnInit() {
    this.user = new User();
  }

  cancel() {
    this.location.back();
  }

  submit() {
    this.userService.registerUser(this.user).subscribe(user => {
      this.user = user;
      this.router.navigate(['/users']);
    }, () => {
      this.toastManagerService.openStandardError(this.USER_ENTITY, this.SAVE_OPERATION);
    }, () => {
      this.toastManagerService.openStandardSuccess(this.USER_ENTITY, this.SAVE_OPERATION);
    });
  }


}
