import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {VersioningComponent} from './versioning.component';
import {AccordionModule} from 'ngx-bootstrap/accordion';
import {ModalModule} from 'ngx-bootstrap/modal';
import {TooltipModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    SharedModule,
    AccordionModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot()
  ],
  declarations: [
    VersioningComponent
  ],
  exports: [
    VersioningComponent
  ]
})
export class VersioningModule {
}
