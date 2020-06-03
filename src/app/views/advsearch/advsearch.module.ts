import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {AdvSearchRoutingModule} from './advsearch-routing.module';
import {AdvSearchComponent} from './advsearch.component';
import {SearchService} from '../../_services/search.service';
import {TagInputModule} from 'ngx-chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    SharedModule,
    AdvSearchRoutingModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AdvSearchComponent
  ],
  providers: [
    SearchService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AdvSearchModule {
}
