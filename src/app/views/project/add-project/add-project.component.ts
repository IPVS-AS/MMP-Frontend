import {Component, OnInit} from '@angular/core';
import {GovernProjectComponent} from '../govern-project/govern-project.component';


@Component({
  selector: 'app-add-project',
  templateUrl: '../govern-project/govern-project.component.html'
})
export class AddProjectComponent extends GovernProjectComponent implements OnInit {
  projectIDExists = true;

  ngOnInit() {
    this.getAllUsers();
    this.isAdd = true;
  }

  submit() {
    if (!this.project.creationDate) {
      this.project.creationDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    }

    this.projectService.addProject(this.project).subscribe(project => {
      this.project = project;
      this.router.navigate(['/projects/list']);
    }, () => {
      this.toastManagerService.openStandardError(this.toastManagerService.PROJECT_ENTITY, this.toastManagerService.SAVE_OPERATION);
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.PROJECT_ENTITY,
        this.toastManagerService.SAVE_OPERATION);
    });
  }
}
