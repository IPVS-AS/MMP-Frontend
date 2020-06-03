import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Model} from '../../_models/model';
import {Project} from '../../_models/project';
import {ModelService} from '../../_services/model.service';
import {ProjectService} from '../../_services/project.service';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';
import {HttpLoadingAnimationComponent} from '../http-loading-animation/http-loading-animation.component';
import {ToasterConfig} from 'angular2-toaster';
import {TimeoutComponent} from '../../timeout/timeout.component';
import {Subscription} from 'rxjs';
import {ToastManagerService} from '../../_services/toast-manager.service';
import {Router} from '@angular/router';
import {ConfirmDialogComponent} from '../../dialog/confirm/confirm-dialog.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DefaultLayoutComponent extends TimeoutComponent implements OnDestroy, OnInit {
  public httpLoadingAnimation = HttpLoadingAnimationComponent;
  public sidebarMinimized = true;
  public element: HTMLElement = document.body;
  private changes: MutationObserver;
  projects: Project[];
  project: Project;
  model: Model;
  projectSubscription: Subscription;
  modelSubscription: Subscription;
  modalRef: BsModalRef;

  constructor(private projectService: ProjectService,
              private modelService: ModelService, private sidebarNotifierService: SidebarNotifierService,
              private toastManagerService: ToastManagerService, private router: Router, private modalService: BsModalService) {
    super();
    this.project = null;
    this.changes = new MutationObserver(() => {
      this.sidebarMinimized = document.body.classList.contains('sidebar-minimized');
    });

    this.changes.observe(<Element>this.element, {
      attributes: true
    });

    this.projectSubscription = this.sidebarNotifierService.notifierProject.subscribe(project => this.project = project);
    this.modelSubscription = this.sidebarNotifierService.notifierModel.subscribe(model => this.model = model);
  }

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      limit: 1,
      showCloseButton: true,
      timeout: 3000
    });

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
    this.modelSubscription.unsubscribe();
  }

  ngOnInit(): void {
    const subscription = this.projectService.getAllProjects().subscribe(projects => {
      this.projects = projects;
      console.log(this.timeout);
      this.cancelTimeout();
    });
    this.waitForTimeOut(subscription);
  }

  deleteProject() {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.successMessage = 'Confirm';
    this.modalRef.content.needsInputField = false;
    this.modalRef.content.message = 'Are sure you want to delete this project?';
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.projectService.deleteProject(this.project.id).subscribe(
          () => {
            this.sidebarNotifierService.notifyProjectAndModel(null, null);
            this.sidebarNotifierService.notifyDeleteProject(true);
            this.router.navigate(['projects/list']);
          }, () => {
            this.toastManagerService.openStandardErrorWithCause(this.toastManagerService.PROJECT_ENTITY,
              this.toastManagerService.DELETE_OPERATION, 'Make sure the project does not have a model in an eam container');
          }, () => {
            this.toastManagerService.openStandardSuccess(this.toastManagerService.PROJECT_ENTITY,
              this.toastManagerService.DELETE_OPERATION);
            this.router.navigate(['projects/list']);
          });
      }
    });
  }

}
