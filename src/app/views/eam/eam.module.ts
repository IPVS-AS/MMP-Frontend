import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {EamComponent} from './eam.component';
import {DragulaModule, DragulaService} from 'ng2-dragula';
import {GridsterModule} from 'angular-gridster2';
import {BusinessProcessComponent} from './business-process/business-process.component';
import {OrganisationUnitComponent} from './organistaion-unit/organisation-unit.component';
import {ReplacementPopupComponent} from './replacement-popup/replacement-popup.component';
import {EamService} from '../../_services/eam.service';
import {MatDialogModule, MatSelectModule} from '@angular/material';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {EamRoutingModule} from './eam-routing.module';
import {ProjectService} from '../../_services/project.service';
import {UserService} from '../../_services/user.service';
import {ModelService} from '../../_services/model.service';
import {ApiProviderService} from '../../_services/api-provider.service';
import {UploadFileService} from '../../_services/upload-file.service';
import {ModelModule} from '../model/model.module';
import {ModalModule, TooltipModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    EamRoutingModule,
    SharedModule,
    DragulaModule,
    GridsterModule,
    MatSelectModule,
    MatDialogModule,
    NgxJsonViewerModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    ModelModule
  ],
  declarations: [
    EamComponent,
    BusinessProcessComponent,
    OrganisationUnitComponent,
    ReplacementPopupComponent,
  ],
  providers: [
    DragulaService,
    EamService,
    ProjectService,
    UserService,
    ModelService,
    ApiProviderService,
    UploadFileService
  ],
  entryComponents: [
    OrganisationUnitComponent,
    BusinessProcessComponent,
    ReplacementPopupComponent
  ]
})
export class EamModule {
}
