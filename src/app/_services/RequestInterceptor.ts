import {Injectable, Injector} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {ToastManagerService} from './toast-manager.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  private SOMETHING_WENT_WRONG_MESSAGE = 'Something went wrong! - If this problem persists please talk to your system administrator!';
  private UNAUTHORIZED_MESSAGE = 'You do not have the permission to do this action!';
  private FORBIDDEN_MESSAGE = 'Server refused the action - You may not have the right permission!';
  private NOT_FOUND_MESSAGE = 'The requested resource could not be found!';
  private TRY_AGAIN_LATER = 'Server timed out - Please try again later';
  private BAD_REQUEST_MESSAGE = 'Server could not process the request - Try modifying it!';
  private UNKNOWN_ERROR_OCCURRED = 'An unknown error occurred - check if the backend is running';

  constructor(private toastManagerService: ToastManagerService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do((event: HttpEvent<any>) => {
    }, (err: any) => {
      console.log('error occured: ' + err.message);
      if (err instanceof HttpErrorResponse) {
        // do error handling here
        const httpError = err as HttpErrorResponse;
        const errorStatus = httpError.status;
        if (errorStatus === 401) {
          this.toastManagerService.openErrorToast(this.UNAUTHORIZED_MESSAGE);
        } else if (errorStatus === 403) {
          this.toastManagerService.openErrorToast(this.FORBIDDEN_MESSAGE);
        } else if (errorStatus === 404) {
          this.toastManagerService.openErrorToast(this.NOT_FOUND_MESSAGE);
        } else if (errorStatus === 408) {
          this.toastManagerService.openErrorToast(this.TRY_AGAIN_LATER);
        } else  if (errorStatus === 400 ) {
          this.toastManagerService.openErrorToast(this.BAD_REQUEST_MESSAGE);
        } else if (errorStatus === 500) {
          this.toastManagerService.openErrorToast(this.SOMETHING_WENT_WRONG_MESSAGE);
        } else if (errorStatus === 0) {
          this.toastManagerService.openErrorToast(this.UNKNOWN_ERROR_OCCURRED);
        }
      }
    });
  }
}
