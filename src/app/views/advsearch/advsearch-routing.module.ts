import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdvSearchComponent} from './advsearch.component';
import {DeploymentComponent} from '../deployment/deployment.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Advanced Search'
    },
    component: AdvSearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvSearchRoutingModule {
}
