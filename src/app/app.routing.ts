import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// Import Containers
import {DefaultLayoutComponent} from './containers';
import {ResourceNotFoundComponent} from './containers/resource-not-found/resource-not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'eam',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    // data: {
    //   title: 'Home'
    //     // },
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full'
      },
      {
        path: 'projects',
        loadChildren: './views/project/project.module#ProjectModule'
      },
      {
        path: 'projects/:projectId/models',
        loadChildren: './views/model/model.module#ModelModule'
      },
      {
        path: 'deployments',
        loadChildren: './views/deployment/deployment.module#DeploymentModule'
      },
      {
        path: 'eam',
        loadChildren: './views/eam/eam.module#EamModule'
      },
      {
        path: 'users',
        loadChildren: './views/user/user.module#UserModule'
      },
      {
        path: 'advsearch',
        loadChildren: './views/advsearch/advsearch.module#AdvSearchModule'
      },
      {
        path: '**',
        component: ResourceNotFoundComponent,
        data: {
          title: 'Not Found'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
