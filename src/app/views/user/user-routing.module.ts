import {RouterModule, Routes} from '@angular/router';
import {UserComponent} from './user.component';
import {AddUserComponent} from './add-user/add-user.component';
import {EditUserComponent} from './edit-user/edit-user.component';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Users'
    },
    children: [
      {
        path: '',
        redirectTo: 'list'
      },
      {
        path: 'list',
        component: UserComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'add',
        component: AddUserComponent,
        data: {
          title: 'Add User'
        }
      },
      {
        path: ':userId/edit',
        component: EditUserComponent,
        data: {
          title: 'Edit User'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
