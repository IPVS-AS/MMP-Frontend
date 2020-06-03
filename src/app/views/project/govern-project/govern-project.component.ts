import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Project} from '../../../_models/project';
import {ProjectService} from '../../../_services/project.service';
import {User} from '../../../_models/user';

import {UserService} from '../../../_services/user.service';
import {DatePipe, Location} from '@angular/common';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {TimeoutComponent} from '../../../timeout/timeout.component';


@Component({
  selector: 'app-govern-project',
  template: ''
})
export class GovernProjectComponent extends TimeoutComponent {
  projectIDExists: boolean;
  projectID: string;
  project: Project;
  users: User[];
  date: string;
  isAdd: boolean;
  inputMaxLength = 255;

  constructor(
    protected projectService: ProjectService,
    protected location: Location,
    protected route: ActivatedRoute,
    protected router: Router,
    protected userService: UserService,
    protected toastManagerService: ToastManagerService,
    protected datePipe: DatePipe) {
    super();
    this.project = new Project();
  }

  cancel() {
    this.location.back();
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe(users => this.users = users);
  }

  submit() {
  }
}
