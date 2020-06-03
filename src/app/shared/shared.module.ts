import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LoadingBarHttpClientModule} from '@ngx-loading-bar/http-client';
import {NgSelectModule} from '@ng-select/ng-select';
import {CollapseModule, TabsetConfig, TooltipModule} from 'ngx-bootstrap';
import {ConnectionErrorComponent} from '../containers/connection-error/connection-error.component';
import {RouterModule} from '@angular/router';
import {AppBreadcrumbModule} from '@coreui/angular';
import {ModelDetailsComponent} from '../views/model/model-details/model-details.component';
import {UploadFileService} from '../_services/upload-file.service';
import {NgHttpLoaderModule} from 'ng-http-loader';
import {LottieAnimationViewModule} from 'ng-lottie';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {RequestInterceptor} from '../_services/RequestInterceptor';
import {ResourceNotFoundComponent} from '../containers/resource-not-found/resource-not-found.component';
import {AppModule} from '../app.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppBreadcrumbModule,
    LoadingBarHttpClientModule,
    NgSelectModule,
    CollapseModule,
    LottieAnimationViewModule.forRoot(),
    NgHttpLoaderModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    ModelDetailsComponent,
    ResourceNotFoundComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppBreadcrumbModule,
    LoadingBarHttpClientModule,
    NgSelectModule,
    ModelDetailsComponent,
    NgHttpLoaderModule,
    ResourceNotFoundComponent
  ],
  providers: [
    DatePipe,
    TabsetConfig,
    UploadFileService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    }
  ]
})
export class SharedModule {
}
