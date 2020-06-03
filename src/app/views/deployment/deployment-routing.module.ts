import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DeploymentComponent} from './deployment.component';
import {ScoringComponent} from './scoring/scoring.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Deployments'
    },
    children: [
      {
        path: '',
        redirectTo: 'list'
      },
      {
        path: 'list',
        component: DeploymentComponent
      },
      {
        path: 'projects/:projectId/models/:modelId/scoring',
        component: ScoringComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeploymentRoutingModule {
}
