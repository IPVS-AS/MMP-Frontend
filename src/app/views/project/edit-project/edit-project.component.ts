import {Component, OnInit} from '@angular/core';
import {GovernProjectComponent} from '../govern-project/govern-project.component';


@Component({
  selector: 'app-edit-project',
  templateUrl: '../govern-project/govern-project.component.html'
})
export class EditProjectComponent extends GovernProjectComponent implements OnInit {
  projectIDExists: boolean;

  ngOnInit() {
    this.projectIDExists = false;
    this.isAdd = false;
    this.getAllUsers();
    this.projectID = this.route.snapshot.paramMap.get('projectId');
    const subscription = this.projectService.getProjectById(this.projectID).subscribe(project => {
      this.project = project;
      if (this.project !== null) {
        this.cancelTimeout();
        this.projectIDExists = true;
      }
      if (this.projectIDExists) {
        this.project.models = [];
        const editorIDs: Object[] = project.editors as Object[];
        this.project.editors = [];
        editorIDs.forEach(editorID => {
          this.userService.getUserById(editorID.toString()).subscribe(editor => {
            this.project.editors.push(editor);
            this.project.editors = Object.assign([], this.project.editors);
          });
        });
      }
    }, () => {
      this.toastManagerService.openGetEntityErrorWithCause(this.toastManagerService.PROJECT_ENTITY,
        'Please talk to your system administrator if the problem perstist!');
    });
    this.waitForTimeOut(subscription);
  }

  submit() {
    this.projectService.updateProject(this.project).subscribe(project => {
      this.project = project;
      this.location.back();
    }, () => {
      this.toastManagerService.openStandardError(this.toastManagerService.PROJECT_ENTITY, this.toastManagerService.UPDATE_OPERATION);
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.PROJECT_ENTITY,
        this.toastManagerService.UPDATE_OPERATION);
    });
  }
}
