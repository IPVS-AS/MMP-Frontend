import {Component, OnInit} from '@angular/core';
import {Model, PMMLMetadata} from '../../../_models/model';
import {Project} from '../../../_models/project';
import {ModelService} from '../../../_services/model.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UploadFileService} from '../../../_services/upload-file.service';
import {HttpClient} from '@angular/common/http';
import {DataSourceType} from '../../../_models/data-source-type';
import Utils from '../../../_utils/Utils';
import {ProjectService} from '../../../_services/project.service';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {OpcuaInformationModel} from '../../../_models/opcua-information-model';
import {DataSource} from '../../../_models/data-source';
import {FormGroup} from '@angular/forms';
import {User} from '../../../_models/user';
import {forkJoin} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {EamService} from '../../../_services/eam.service';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {Location} from '@angular/common';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {ConfirmDialogComponent} from '../../../dialog/confirm/confirm-dialog.component';
import {SidebarNotifierService} from '../../../_services/sidebar-notifier.service';
import {TimeoutComponent} from '../../../timeout/timeout.component';

@Component({
  selector: 'app-model-individual',
  templateUrl: './model-individual.component.html',
  styleUrls: ['./model-individual.component.css']
})
export class ModelIndividualComponent extends TimeoutComponent implements OnInit {

  projectID: string;
  modelID: string;

  project: Project;
  model: Model;

  oldOpcuaInformationModelIds: string[];
  opcuaInformationModels: OpcuaInformationModel[];
  dataSource: DataSource;
  uploadService: UploadFileService;
  form: FormGroup;
  date: string;
  opcuaFiles: File[];
  oldModelFileId: string;
  pmmlFile: File;
  pmmlMetadata: PMMLMetadata;
  showPmml: boolean;
  pmmlUploader: FileUploader = new FileUploader({});
  opcuaUploader: FileUploader = new FileUploader({});

  pmmlurl: SafeUrl;
  opcuaurl: SafeUrl;
  opcuaurls: SafeUrl[];

  users: User[];
  projectIDExists: boolean;
  modelIDExists: boolean;
  modalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
              private modelService: ModelService,
              private projectService: ProjectService,
              protected httpService: HttpClient,
              private sanitizer: DomSanitizer,
              private router: Router,
              private toastManagerService: ToastManagerService,
              private eamService: EamService,
              private location: Location,
              private sidebarNotifierService: SidebarNotifierService,
              private modalService: BsModalService) {
    super();
  }

  ngOnInit() {
    this.uploadService = new UploadFileService(this.httpService);

    this.projectID = this.route.snapshot.paramMap.get('projectId');
    this.modelID = this.route.snapshot.paramMap.get('modelId');
    this.projectIDExists = false;
    this.modelIDExists = false;
    const subscription = this.projectService.getProjectById(this.projectID).subscribe((project: Project) => {
      this.project = project;
      this.projectIDExists = this.project != null;
      this.cancelTimeout();
      if (this.projectIDExists) {
        const modelSubscripton = this.modelService.getModelInProject(this.projectID, this.modelID).subscribe(model => {
          this.model = model;
          this.cancelTimeout();
          this.modelIDExists = this.model != null;

          // If there is already a ModelFile set in the Model, then get it from the Backend.
          // Also get the blob from it and create a File from it for late savings.
          if (this.model.modelFile != null) {
            this.oldModelFileId = String(this.model.modelFile.id);
            this.uploadService.getModelFileRaw(
              String(model.modelFile.id), this.projectID, this.modelID).subscribe(blob => {
              this.pmmlFile = new File(new Array(blob), model.modelFile.dbFile.fileName);
              this.pmmlMetadata = this.pmmlRemoveNull(model.modelMetadata.pmmlMetadata);
              this.showPmml = true;
              const fileItem = new FileItem(this.pmmlUploader, this.pmmlFile, {});
              this.pmmlUploader.queue.push(fileItem);
              this.pmmlurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(this.pmmlFile));
            });
          }

          this.oldOpcuaInformationModelIds = [];
          this.opcuaFiles = [];
          this.opcuaInformationModels = [];
          this.opcuaurls = [];
          // If there is already and OPC UA Informaiton Model set in the Model, then get it from the Backend.
          // Also get the blob from it and create a File from it for late savings.
          if (this.model.opcuaInformationModels !== null && this.model.opcuaInformationModels.length > 0) {
            for (const opcuaModel of this.model.opcuaInformationModels) {
              this.oldOpcuaInformationModelIds.push(String(opcuaModel));
            }

            this.oldOpcuaInformationModelIds.forEach(modelid => {
              this.uploadService.getOpcuaInformationModel(modelid, this.projectID, this.modelID).subscribe(opcuaModel => {
                this.uploadService.getOpcuaInformationModelRaw(modelid, this.projectID, this.modelID)
                  .subscribe(blob => {
                    const file = new File(new Array(blob), opcuaModel.dbFile.fileName);
                    this.opcuaFiles.push(file);
                    const fileItem = new FileItem(this.opcuaUploader, file, {});
                    this.opcuaUploader.queue.push(fileItem);
                    this.model.opcuaInformationModels.push(opcuaModel);
                    this.opcuaInformationModels.push(opcuaModel);
                    this.opcuaurls.push(this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file)));
                  });
              });
            });
          }

          this.dataSource = new DataSource();
          if (this.model.opcuaInformationModels != null && this.model.opcuaInformationModels.length > 0) {
            this.dataSource.type = DataSourceType.Opcua;
          } else if (this.model.relationalDBInformation != null &&
            this.model.relationalDBInformation.type === DataSourceType.RelationalDataBase) {
            this.dataSource = this.model.relationalDBInformation;
            this.dataSource.type = DataSourceType.RelationalDataBase;
          } else {
            this.dataSource.type = null;
          }
        });
        this.waitForTimeOut(modelSubscripton);

      }
    });
    this.waitForTimeOut(subscription);
  }

  openConfirmationDialog() {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.eamService.getAllEamContainersByModelId(this.model.id).subscribe(eamContainers => {
      let warningMessage = 'Are sure you want to delete this model?';
      if (eamContainers.length > 0 ) {
        warningMessage += '\n\n' + 'The model "' + this.model.modelMetadata.name +
          '" is contained in ' + eamContainers.length + ' EAM Container!';
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
    this.eamService.getAllEamContainersByModelId(this.model.id).subscribe(eamContainers => {
        if (eamContainers.length > 0) {
          const eamContainerObservables = [];
          eamContainers.forEach(container => eamContainerObservables.push(this.eamService.deleteEamContainer(container.id)));
          forkJoin(eamContainerObservables).subscribe(() => {
            this.deleteActualModel();
          }, () => {
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
      this.model = null;
    }, () => {
      this.toastManagerService.openStandardError(this.toastManagerService.MODEL_ENTITY,
        this.toastManagerService.DELETE_OPERATION);
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.MODEL_ENTITY, this.toastManagerService.DELETE_OPERATION);
      this.location.back();
      this.sidebarNotifierService.notifyDeleteModel(true);
      this.sidebarNotifierService.notifyModel(null);
    });
  }

  formatBytes(bytes: number) {
    return Utils.formatBytes(bytes);
  }

  notEmptyOrNull(list) {
    return Utils.notEmptyOrNull(list);
  }

  pmmlRemoveNull(pmml) {
    return JSON.parse(JSON.stringify(pmml, (key, value) => {
      if (value !== null) {
        return value;
      }
    }));
  }

}

