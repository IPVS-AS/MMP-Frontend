import {NgModule} from '@angular/core';
import {LineageComponent} from './lineage.component';
import {SharedModule} from '../../shared/shared.module';
import {TreeviewModule} from 'ngx-treeview';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {TabsModule} from 'ngx-bootstrap';
import {CollapsibleTreeComponent} from '../collapsible-tree/collapsible-tree.component';

@NgModule({
  imports: [
    SharedModule,
    TreeviewModule.forRoot(),
    NgxJsonViewerModule,
    TabsModule
  ],
  declarations: [
    LineageComponent,
    CollapsibleTreeComponent
  ],
  exports: [
    LineageComponent,
    TreeviewModule,
    CollapsibleTreeComponent,
    NgxJsonViewerModule,
    TabsModule
  ]
})
export class LineageModule {
}
