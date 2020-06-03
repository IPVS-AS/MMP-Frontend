import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {UserComponent} from './user.component';
import {AddUserComponent} from './add-user/add-user.component';
import {EditUserComponent} from './edit-user/edit-user.component';
import {UserRoutingModule} from './user-routing.module';
import {UserService} from '../../_services/user.service';
import {TooltipModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    UserRoutingModule,
    SharedModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    UserComponent,
    AddUserComponent,
    EditUserComponent],
  providers: [
    UserService
  ]
})
export class UserModule {
}
