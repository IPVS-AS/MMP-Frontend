import {Component, OnInit} from '@angular/core';

import {GovernModelComponent} from '../govern-model/govern-model.component';
import {UploadFileService} from '../../../_services/upload-file.service';
import {Project} from '../../../_models/project';
import {DataSourceType} from '../../../_models/data-source-type';
import {DataSource} from '../../../_models/data-source';


@Component({
  selector: 'app-add-model',
  templateUrl: '../govern-model/govern-model.component.html',
  styleUrls: ['../govern-model/govern-model.component.css']

})
export class AddModelComponent extends GovernModelComponent implements OnInit {

  projectIDExists: boolean;
  modelIDExists: boolean;

  ngOnInit() {
    this.projectIDExists = false;
    this.modelIDExists = true;

    this.isAdd = true;
    this.uploadService = new UploadFileService(this.httpService);
    this.existsProject = false;
    this.projectID = this.route.snapshot.paramMap.get('projectId');

    if (this.projectID !== null) {
      this.existsProject = true;
      const subscription = this.projectService.getProjectById(this.projectID).subscribe((project: Project) => {this.project = project;
        if (this.project !== null ) {
          this.cancelTimeout();
          this.projectIDExists = true;
        }
      });
      this.waitForTimeOut(subscription);
    } else {
      this.getProjects();
    }
    if (this.project !== null ) {
      this.projectIDExists = true;
    }

    this.setModelGroupIfExists(this.route.snapshot.queryParamMap.get('model'));
    this.dataSource = new DataSource();

    this.getAllUsers();

    this.form = this.formBuilder.group({
      customFields: this.formBuilder.array([]),
    });
  }

  submit() {
    this.model.modelMetadata.customFields = [];
    (this.customFields.value as string[]).forEach(entry => {
      const entryData = Object.values(entry);
      this.model.modelMetadata.customFields.push({fieldName: entryData[0], fieldContent: entryData[1]});
    });
    this.model.modelMetadata.lastModified = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.model.id = null;
    this.model.modelFile = null;
    this.model.opcuaInformationModels = [];
    if (this.dataSource.type === DataSourceType.Opcua) {
      this.model.relationalDBInformation = null;
    } else if (this.dataSource.type === DataSourceType.RelationalDataBase) {
      this.model.relationalDBInformation.type = DataSourceType.RelationalDataBase;
      this.opcuaFiles = [];
    } else {
      this.model.relationalDBInformation = null;
      this.opcuaFiles = [];
    }
    this.modelService.addModelToProject(this.project.id, this.model).subscribe(model => {
      this.model = model;
      this.uploadFilesAndRedirect();
    }, () => {
      this.toastManagerService.openStandardErrorWithCause(this.MODEL_ENTITY, this.SAVE_OPERATION, 'Unable to update model');
    }, () => {
      this.toastManagerService.openStandardSuccess(this.MODEL_ENTITY, this.SAVE_OPERATION);
    });
  }
}
