import {Component, OnInit} from '@angular/core';
import {CustomField} from '../../../_models/model';
import {FileItem} from 'ng2-file-upload';
import {UploadFileService} from '../../../_services/upload-file.service';
import {Project} from '../../../_models/project';
import {GovernModelComponent} from '../govern-model/govern-model.component';
import {DataSourceType} from '../../../_models/data-source-type';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-edit-model',
  templateUrl: '../govern-model/govern-model.component.html',
  styleUrls: ['../govern-model/govern-model.component.css']
})
export class EditModelComponent extends GovernModelComponent implements OnInit {

  public projectIDExists: boolean;
  modelIDExists: boolean;

  ngOnInit() {
    this.projectIDExists = false;
    this.modelIDExists = false;
    this.isAdd = false;
    this.uploadService = new UploadFileService(this.httpService);

    this.projectID = this.route.snapshot.paramMap.get('projectId');
    this.modelID = this.route.snapshot.paramMap.get('modelId');

    this.existsProject = true;
    const projectSubscription = this.projectService.getProjectById(this.projectID).subscribe((project: Project) => {this.project = project;
      if (this.project !== null ) {
        this.cancelTimeout();
        this.projectIDExists = true;
      }

      if (this.projectIDExists) {
        this.getAllUsers();
        const modelSubscription =  this.modelService.getModelInProject(this.projectID, this.modelID).subscribe(model => {
          this.cancelTimeout();
          this.model = model;
          this.modelIDExists = true;

          // If there is already a ModelFile set in the Model, then get it from the Backend.
          // Also get the blob from it and create a File from it for late savings.
          if (this.model.modelFile != null) {
            this.oldModelFileId = String(this.model.modelFile.id);
            this.uploadService.getModelFileRaw(
              String(model.modelFile.id), this.projectID, this.modelID).subscribe(blob => {
              this.pmmlFile = new File(new Array(blob), model.modelFile.dbFile.fileName);
              this.pmmlMetadata = super.pmmlRemoveNull(model.modelMetadata.pmmlMetadata);
              this.showPmml = true;
              const fileItem = new FileItem(this.pmmlUploader, this.pmmlFile, {});
              this.pmmlUploader.queue.push(fileItem);
            });
          }

          // If there is already and OPC UA Informaiton Model set in the Model, then get it from the Backend.
          // Also get the blob from it and create a File from it for late savings.
          if (this.model.opcuaInformationModels != null && this.model.opcuaInformationModels.length > 0) {
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
                    this.updateOpcuaTree();
                  });
              });
            });

          }
          (this.model.modelMetadata.customFields).forEach((entry) => {
            const entryData = entry as CustomField;
            this.customFields.push(this.formBuilder.group(
              {fieldName: entryData.fieldName, fieldContent: entryData.fieldContent}));
          });

          if (this.model.opcuaInformationModels != null && this.model.opcuaInformationModels.length > 0) {
            this.dataSource.type = DataSourceType.Opcua;
          } else if (this.model.relationalDBInformation != null &&
            this.model.relationalDBInformation.type === DataSourceType.RelationalDataBase) {
            this.dataSource = this.model.relationalDBInformation;
            this.dataSource.type = DataSourceType.RelationalDataBase;
          } else {
            this.dataSource.type = null;
          }

          this.onStateChange();
        }, error => { console.log('Invalid Model ID');
        });
        this.waitForTimeOut(modelSubscription);
        this.form = this.formBuilder.group({
          customFields: this.formBuilder.array([]),
        });
      }
    });
    this.waitForTimeOut(projectSubscription);
  }


  submit() {
    this.model.modelMetadata.customFields = [];
    (this.customFields.value as string[]).forEach(entry => {
      const entryData = Object.values(entry);
      this.model.modelMetadata.customFields.push({fieldName: entryData[0], fieldContent: entryData[1]});
    });
    this.model.modelMetadata.lastModified = this.datePipe.transform(new Date(), 'yyyy-MM-dd');


    /*
    If a ModelFile or an OPC UA Information Model is already present in the Model, we have to delete them
    first in the Backend. Afterwards we can save them again.
     */
    this.model.modelFile = null;
    this.model.opcuaInformationModels = [];
    if (this.dataSource.type === DataSourceType.Opcua) {
      this.model.relationalDBInformation = null;
    } else {
      this.opcuaFiles = [];
    }

    // If both are present, remove both before updating Model.
    if (this.oldOpcuaInformationModelIds && this.oldOpcuaInformationModelIds.length > 0 && this.oldModelFileId) {
      this.uploadService.deleteModelFile(this.oldModelFileId, this.projectID, this.modelID).subscribe(() => {
        const opcuas = [];
        this.oldOpcuaInformationModelIds.forEach(oldOpcuaInformationModelId =>
          opcuas.push(this.uploadService.deleteOpcuaFile(oldOpcuaInformationModelId, this.projectID, this.modelID))
        );
        forkJoin(opcuas)
          .subscribe(() => {
            this.modelService.updateModelInProject(this.project.id, this.model).subscribe(model => {
              this.model = model;
              this.uploadFilesAndRedirect();
            }, () => {
              this.toastManagerService.openStandardErrorWithCause(this.OPCUA_FILE_TYPE,
                this.SAVE_OPERATION, 'Could not upload files!');
            });
          }, () => {
            this.toastManagerService.openStandardErrorWithCause(this.OPCUA_FILE_TYPE,
              this.SAVE_OPERATION, 'Unable to update model!');
          }, () => {
            this.toastManagerService.openStandardSuccess(this.MODEL_ENTITY, this.SAVE_OPERATION);
          });
      });
      // If only the ModelFile is present, remove only the ModelFile.
    } else if (this.oldModelFileId) {
      this.uploadService.deleteModelFile(this.oldModelFileId, this.projectID, this.modelID).subscribe(() => {
        this.modelService.updateModelInProject(this.project.id, this.model).subscribe(model => {
          this.model = model;
          this.uploadFilesAndRedirect();
        }, () => {
          this.toastManagerService.openStandardErrorWithCause(this.MODEL_ENTITY,
            this.SAVE_OPERATION, 'Could not upload files');
        });
      }, () => {
        this.toastManagerService.openStandardError(this.MODEL_ENTITY, this.toastManagerService.UPDATE_OPERATION);
      }, () => {
        this.toastManagerService.openStandardSuccess(this.MODEL_ENTITY, this.SAVE_OPERATION);
      });
      // If only the OPC UA Information Model is present, remove it only.
    } else if (this.oldOpcuaInformationModelIds && this.oldOpcuaInformationModelIds.length > 0) {
      const opcuas = [];
      this.oldOpcuaInformationModelIds.forEach(oldOpcuaInformationModelId =>
        opcuas.push(this.uploadService.deleteOpcuaFile(oldOpcuaInformationModelId, this.projectID, this.modelID))
      );
      forkJoin(opcuas)
        .subscribe(() => {
          this.modelService.updateModelInProject(this.project.id, this.model).subscribe(model => {
            this.model = model;
            this.uploadFilesAndRedirect();
            }, () => {
              this.toastManagerService.openStandardErrorWithCause(this.MODEL_ENTITY,
                this.SAVE_OPERATION, 'Could not upload files');
            });
        }, () => {
          this.toastManagerService.openStandardErrorWithCause(this.MODEL_ENTITY, this.SAVE_OPERATION, 'Unable to update model');
        }, () => {
          this.toastManagerService.openStandardSuccess(this.MODEL_ENTITY, this.SAVE_OPERATION);
        });
      // If neither already exists in the model, then just do a normal update on the Model.
    } else {
      this.modelService.updateModelInProject(this.project.id, this.model).subscribe(model => {
        this.model = model;
        this.uploadFilesAndRedirect();
      }, () => {
        this.toastManagerService.openStandardError(this.MODEL_ENTITY, this.SAVE_OPERATION);
      }, () => {
        this.toastManagerService.openStandardSuccess(this.MODEL_ENTITY, this.SAVE_OPERATION);
      });
    }
  }
}
