import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

import {PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {AppComponent} from './app.component';
// Import containers
import {DefaultLayoutComponent} from './containers';

import {AppBreadcrumbModule, AppHeaderModule, AppSidebarModule} from '@coreui/angular';
// Import routing module
import {AppRoutingModule} from './app.routing';
// Import 3rd party components
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ResourceNotFoundComponent} from './containers/resource-not-found/resource-not-found.component';
import {NgHttpLoaderModule} from 'ng-http-loader';
import {HttpLoadingAnimationComponent} from './containers/http-loading-animation/http-loading-animation.component';
import {LottieAnimationViewModule} from 'ng-lottie';
import {ToasterModule} from 'angular2-toaster';
import {RequestInterceptor} from './_services/RequestInterceptor';
import {ToastManagerService} from './_services/toast-manager.service';
import {ConfirmationDialogComponent} from './dialog/confirmation/confirmation-dialog.component';
import {MatDialogModule} from '@angular/material';
import {ConfirmDialogComponent} from './dialog/confirm/confirm-dialog.component';
import {ModalModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConnectionErrorComponent} from './containers/connection-error/connection-error.component';
import {SharedModule} from './shared/shared.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const APP_CONTAINERS = [
  DefaultLayoutComponent,
  HttpLoadingAnimationComponent,
  ConnectionErrorComponent
];

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    // AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ToasterModule.forRoot(),
    ChartsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgHttpLoaderModule,
    LottieAnimationViewModule.forRoot(),
    SharedModule,
    MatDialogModule,
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    ConfirmationDialogComponent,
    ConfirmDialogComponent
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: RequestInterceptor,
    multi: true,
  },
    ToastManagerService],
  bootstrap: [AppComponent],
  entryComponents: [
  HttpLoadingAnimationComponent,
    ConnectionErrorComponent,
    ConfirmationDialogComponent,
    ConfirmDialogComponent
  ]
})
export class AppModule {
}
