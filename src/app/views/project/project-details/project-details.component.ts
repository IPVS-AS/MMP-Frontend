import {Component, Input, OnChanges} from '@angular/core';
import {Project} from '../../../_models/project';
import {User} from '../../../_models/user';
import {ModelGroup} from '../../../_models/model';
import {ModelService} from '../../../_services/model.service';
import {UserService} from '../../../_services/user.service';
import {ProjectService} from '../../../_services/project.service';
import {ProjectComponent} from '../project.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {ConfirmDialogComponent} from '../../../dialog/confirm/confirm-dialog.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import 'rxjs-compat/add/operator/filter';
import {SidebarNotifierService} from '../../../_services/sidebar-notifier.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent implements OnChanges {

  @Input() project: Project;
  @Input() parent: ProjectComponent;

  public users: User[];
  modalRef: BsModalRef;
  projectID: string;
  public models: ModelGroup[];
  public projects: Project[];

  constructor(private modelService: ModelService, private userService: UserService, private projectService: ProjectService,
              private router: Router, private toastManagerService: ToastManagerService, private modalService: BsModalService,
              private route: ActivatedRoute, private sidebarNotifierService: SidebarNotifierService) {
    this.models = [];
    this.users = [];
  }

  ngOnChanges() {
    if (this.project) {
      this.getModels();
      this.getUsers();
    }
    this.projectID = this.route.snapshot.paramMap.get('projectId');
  }

  getModels(): void {
    this.modelService.getAllModelGroupsInProject(this.project.id).subscribe(models => this.models = models, () => {
      this.toastManagerService.openGetEntityErrorWithCause(this.toastManagerService.MODEL_ENTITY,
        this.toastManagerService.CHECK_BACKEND_CONNECTION);
    });
  }

  getUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = [];
      for (const u of users) {
        // @ts-ignore
        if (this.project.editors.indexOf(u.id) !== -1) {
          this.users.push(u);
        }
      }
    }, () => {
      this.toastManagerService.openGetEntityErrorWithCause(this.toastManagerService.USER_ENTITY,
        this.toastManagerService.CHECK_BACKEND_CONNECTION);
    });
  }

  openConfirmationDialog() {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.message = 'Are sure you want to delete this project?';
    this.modalRef.content.successMessage = 'Confirm';
     this.modalRef.content.onClose.subscribe(result => {
       if (result === true) {
         this.deleteProject();
       }
     });
  }

  deleteProject() {
    this.projectService.deleteProject(this.project.id).subscribe(() => {
      if (this.projectID) {
        this.router.navigate(['/projects/list']);
      } else {
        this.parent.getProjects();
      }
    }, () => {
      this.toastManagerService.openStandardErrorWithCause(this.toastManagerService.PROJECT_ENTITY,
        this.toastManagerService.DELETE_OPERATION, 'Make sure the project does not have a model in an eam container');
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.PROJECT_ENTITY,
        this.toastManagerService.DELETE_OPERATION);
      this.sidebarNotifierService.notifyDeleteModel(true);
      this.sidebarNotifierService.notifyProjectAndModel(null, null);
      this.project = null;
    });
  }
}
