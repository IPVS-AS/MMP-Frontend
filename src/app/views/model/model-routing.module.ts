import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelListComponent} from './model-list/model-list.component';
import {AddModelComponent} from './add-model/add-model.component';
import {EditModelComponent} from './edit-model/edit-model.component';
import {LineageComponent} from '../lineage/lineage.component';
import {ModelIndividualComponent} from './model-individual/model-individual.component';
import {VersioningComponent} from '../versioning/versioning.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Models'
    },
    children: [
      {
        path: '',
        redirectTo: 'list'
      },
      {
        path: 'list',
        component: ModelListComponent,
        data: {
          title: 'Models'
        }
      },
    ]
  },
  {
        path: 'add',
        component: AddModelComponent,
        data: {
          title: 'Add Model'
        }
      },
      {
        path: ':modelId/add',
        component: AddModelComponent,
        data: {
          title: 'Add Model'
        }
      },
      {
        path: ':modelId/edit',
        component: EditModelComponent,
        data: {
          title: 'Edit Model'
        }
      },
      {
        path: ':modelId/lineage',
        component: LineageComponent,
        data: {
          title: 'Lineage'
        }
      },
      {
        path: ':modelId',
        component: ModelIndividualComponent,
        data: {
          title: 'Model'
        }
      },
      {
        path: ':modelId/versioning',
        component: VersioningComponent,
        data: {
          title: 'Versioning'
        }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule {
}
