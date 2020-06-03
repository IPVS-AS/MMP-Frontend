import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange} from '@angular/core';
import {Model} from '../../../_models/model';
import {Project} from '../../../_models/project';
import {ModelService} from '../../../_services/model.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ModelListComponent} from '../model-list/model-list.component';
import {UploadFileService} from '../../../_services/upload-file.service';
import {HttpClient} from '@angular/common/http';
import Utils from '../../../_utils/Utils';
import {forkJoin} from 'rxjs';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {EamService} from '../../../_services/eam.service';
import {ConfirmDialogComponent} from '../../../dialog/confirm/confirm-dialog.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {SidebarNotifierService} from '../../../_services/sidebar-notifier.service';

@Component({
  selector: 'app-model-details',
  templateUrl: './model-details.component.html',
})
export class ModelDetailsComponent implements OnInit, OnChanges {
  @Input() model: Model;
  @Input() project: Project;
  @Input() parent: ModelListComponent;
  @Input() inEAMView: Boolean;
  @Input() inSearchView: Boolean;
  @Input() eamSaved: Boolean;

  @Output() removedModel = new EventEmitter<Model>();
  @Output() beforeDeletion = new EventEmitter<boolean>();

  uploadService: UploadFileService;
  projectID: string;
  isCollapsed: boolean;
  infoText: string;
  private deletingModel: boolean;
  modalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private toastManagerService: ToastManagerService,
              private modelService: ModelService,
              private eamService: EamService,
              private httpService: HttpClient,
              private uploadFileService: UploadFileService,
              private sidebarNotifierService: SidebarNotifierService,
              private modalService: BsModalService
  ) {
    this.infoText = 'Show PMML Metadata';
    this.isCollapsed = true;
  }

  ngOnInit() {
    if (this.project) {
      this.projectID = this.project.id;
    } else if (this.model) {
      this.projectID = String(this.model.projectId);
    } else {
      this.projectID = this.route.snapshot.paramMap.get('projectId');
    }

    this.uploadService = new UploadFileService(this.httpService);

    if (this.model != null && this.model.opcuaInformationModels && this.model.opcuaInformationModels.length > 0) {
      this.model.opcuaInformationModels.forEach(opcuaModelid => {
        this.uploadFileService.getOpcuaInformationModel(String(opcuaModelid), this.projectID, this.model.id)
          .subscribe(opcuamodel => {
            this.model.opcuaInformationModels.push(opcuamodel);
          });
      });
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (this.deletingModel && this.eamSaved) {
      this.continueDeletion();
    }
  }

  openConfirmationDialog() {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.eamService.getAllEamContainersByModelId(this.model.id).subscribe(eamContainers => {
      let warningMessage = 'Are sure you want to delete this model?';
      if (eamContainers.length > 0 ) {
        warningMessage += '\n\n' + 'The model "' + this.model.modelMetadata.name +
          '" is contained in ' + eamContainers.length + ' EAM Container!';
      }
      if (this.inEAMView) {
        warningMessage += '\n' + 'All changes to the EAM Grid will be saved before deletion!';
      }
      this.modalRef.content.message = warningMessage;
      this.modalRef.content.successMessage = 'Confirm';
      this.modalRef.content.onClose.subscribe(result => {
        if (result === true) {
          this.deleteModel();
        }
      });
    });
  }

  deleteModel() {
    if (this.inEAMView) {
      this.deletingModel = true;
      this.beforeDeletion.emit(true);
    } else {
      this.deletingModel = true;
      this.continueDeletion();
    }
  }

  continueDeletion() {
    this.eamService.getAllEamContainersByModelId(this.model.id).subscribe(eamContainers => {
      if (eamContainers.length > 0) {
        const eamContainerObservables = [];
        eamContainers.forEach(container => eamContainerObservables.push(this.eamService.deleteEamContainer(container.id)));
        forkJoin(eamContainerObservables).subscribe(() => {
          this.deleteActualModel();
        }, () => {
          this.deletingModel = false;
          this.toastManagerService.openStandardError(this.toastManagerService.MODEL_ENTITY,
            this.toastManagerService.DELETE_OPERATION);
        });
      } else {
        this.deleteActualModel();
      }
    });
  }

  deleteActualModel() {
    this.modelService.deleteModelFromProject(String(this.model.projectId), this.model.id).subscribe(() => {
      if (this.parent) {
        this.parent.getModels();
      }
      this.removedModel.emit(this.model);
      this.model = null;
    }, () => {
      this.toastManagerService.openStandardError(this.toastManagerService.MODEL_ENTITY,
        this.toastManagerService.DELETE_OPERATION);
      this.deletingModel = false;
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.MODEL_ENTITY, this.toastManagerService.DELETE_OPERATION);
      this.beforeDeletion.emit(false);
      this.deletingModel = false;
      this.sidebarNotifierService.notifyDeleteModel(true);
      if (this.inEAMView || this.inSearchView) {
        this.sidebarNotifierService.notifyProjectAndModel(null, null);
      } else {
        this.sidebarNotifierService.notifyModel(null);
      }
    });
  }


  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.infoText = 'Show PMML Metadata';
    } else {
      this.infoText = 'Hide PMML Metadata';
    }
  }

  formatBytes(bytes: number) {
    return Utils.formatBytes(bytes);
  }

  notEmptyOrNull(list) {
    return Utils.notEmptyOrNull(list);
  }
}
