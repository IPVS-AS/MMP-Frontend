import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ScoringService} from '../../_services/scoring.service';
import {ScoringComponent} from './scoring/scoring.component';
import {DeploymentComponent} from './deployment.component';
import {ModelService} from '../../_services/model.service';
import {ProjectService} from '../../_services/project.service';
import {CustomIntervalDirective} from '../../_utils/Validators';
import {DeploymentRoutingModule} from './deployment-routing.module';

@NgModule({
  imports: [
    DeploymentRoutingModule,
    SharedModule,
  ],
  declarations: [
    DeploymentComponent,
    ScoringComponent,
    CustomIntervalDirective
  ],
  providers: [
    ModelService,
    ProjectService,
    ScoringService
  ]
})
export class DeploymentModule {
}
