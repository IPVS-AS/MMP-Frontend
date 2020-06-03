import {NgModule} from '@angular/core';

import {ProjectComponent} from './project.component';
import {ProjectRoutingModule} from './project-routing.module';
import {ProjectDetailsComponent} from './project-details/project-details.component';
import {AddProjectComponent} from './add-project/add-project.component';
import {EditProjectComponent} from './edit-project/edit-project.component';
import {ProjectService} from '../../_services/project.service';
import {UserService} from '../../_services/user.service';
import {ModelService} from '../../_services/model.service';
import {ApiProviderService} from '../../_services/api-provider.service';
import {SharedModule} from '../../shared/shared.module';
import {CollapseModule, TooltipModule} from 'ngx-bootstrap';
import {ProjectIndividualComponent} from './project-individual/project-individual.component';
import {GovernProjectComponent} from './govern-project/govern-project.component';


@NgModule({
  imports: [
    ProjectRoutingModule,
    SharedModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot()
  ],
  declarations: [
    ProjectComponent,
    ProjectDetailsComponent,
    AddProjectComponent,
    EditProjectComponent,
    ProjectIndividualComponent,
    GovernProjectComponent
  ],
  providers: [
    ProjectService,
    UserService,
    ModelService,
    ApiProviderService,
  ],
  exports: [
    ProjectDetailsComponent
  ]
})
export class ProjectModule {
}
