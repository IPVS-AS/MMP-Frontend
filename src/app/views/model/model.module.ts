import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {ModelRoutingModule} from './model-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ProjectService} from '../../_services/project.service';
import {UserService} from '../../_services/user.service';
import {ModelService} from '../../_services/model.service';
import {ApiProviderService} from '../../_services/api-provider.service';
import {AddModelComponent} from './add-model/add-model.component';
import {EditModelComponent} from './edit-model/edit-model.component';
import {GovernModelComponent} from './govern-model/govern-model.component';
import {ModelComponent} from './model.component';
import {ModelFileDetailsComponent} from './model-file-details/model-file-details.component';
import {ModelListComponent} from './model-list/model-list.component';
import {LineageModule} from '../lineage/lineage.module';
import {FileUploadModule} from 'ng2-file-upload';
import {ReactiveFormsModule} from '@angular/forms';
import {CollapseModule, ModalModule, TooltipModule} from 'ngx-bootstrap';
import {ProjectModule} from '../project/project.module';
import {ModelIndividualComponent} from './model-individual/model-individual.component';
import {VersioningModule} from '../versioning/versioning.module';
import {UploadFileService} from '../../_services/upload-file.service';
import {MatDialogModule} from '@angular/material';
import {ConfirmDialogComponent} from '../../dialog/confirm/confirm-dialog.component';
import {AppModule} from '../../app.module';

@NgModule({
  imports: [
    ModelRoutingModule,
    SharedModule,
    LineageModule,
    VersioningModule,
    FileUploadModule,
    ReactiveFormsModule,
    CollapseModule,
    ProjectModule,
    TooltipModule.forRoot(),
    MatDialogModule
  ],
  declarations: [
    AddModelComponent,
    EditModelComponent,
    GovernModelComponent,
    ModelComponent,
    ModelFileDetailsComponent,
    ModelListComponent,
    ModelIndividualComponent
  ],
  providers: [
    ProjectService,
    UserService,
    ModelService,
    ApiProviderService,
    UploadFileService,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModelModule {
}
