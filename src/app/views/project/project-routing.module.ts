import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ProjectComponent} from './project.component';
import {AddProjectComponent} from './add-project/add-project.component';
import {EditProjectComponent} from './edit-project/edit-project.component';
import {ProjectIndividualComponent} from './project-individual/project-individual.component';
import {ProjectDetailsComponent} from './project-details/project-details.component';

const routes: Routes = [
    {
      path: '',
      data: {
        title: 'Projects'
      },
      children: [
        {
          path: '',
          redirectTo: 'list'
        },
        {
          path: 'list',
          component: ProjectComponent,
          data: {
            title: 'List'
          }
        },
        {
          path: 'add',
          component: AddProjectComponent,
          data: {
            title: 'Add Project'
          }
        },
        {
          path: ':projectId/edit',
          component: EditProjectComponent,
          data: {
            title: 'Edit Project'
          }
        },
        {
          path: ':projectId',
          component: ProjectIndividualComponent,
          data: {
            title: 'Project'
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
export class ProjectRoutingModule {
}
