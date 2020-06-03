import {RouterModule, Routes} from '@angular/router';
import {EamComponent} from './eam.component';
import {NgModule} from '@angular/core';
import {AddModelComponent} from '../model/add-model/add-model.component';

const routes: Routes = [
    {
      path: '',
      component: EamComponent,
      data: {
        title: 'Enterprise Architecture Management for Analytics'
      },
      children: [
        {
          path: '/eam/add',
          component: AddModelComponent,
          data: {
            title: 'Add Model'
          }
        }
      ]
    },
  ]
;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EamRoutingModule {
}
