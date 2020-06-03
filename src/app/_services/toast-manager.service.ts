import {ToasterService} from 'angular2-toaster';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastManagerService {

  CAUSE = '{Cause}';
  FILE_TYPE = '{Filetype}';
  OPERATION = '{Operation}';
  ENTITY = '{Entity}';

  // error messages
  fileParseErrorMessage = 'Invalid' + this.FILE_TYPE + ' File (unable to parse)';
  fileParseSuccessMessage = this.FILE_TYPE + ' File successfully parsed';
  defaultErrorMessage = 'Failed to ' + this.OPERATION + ' ' + this.ENTITY
    + ' - If this problem persists please talk to your system administrator!';
  defaultErrorMessageWithCause = 'Failed to ' + this.OPERATION + ' ' + this.ENTITY + ' - ' + this.CAUSE + '!';
  defaultSuccesMessage = 'Successfully ' + this.OPERATION +  'd ' + this.ENTITY;
  defaultGetEntityErrorMessage = 'Unable to get ' + this.ENTITY + '(s) - ' + this.CAUSE;

  // operations
  SAVE_OPERATION = 'save';
  DELETE_OPERATION = 'delete';
  UPDATE_OPERATION = 'update';

  // causes
  CHECK_BACKEND_CONNECTION = 'Check if the backend is up and running';

  // entities
  PROJECT_ENTITY = 'project';
  MODEL_ENTITY = 'model';
  USER_ENTITY = 'user';
  EAM_CONTAINER = 'eam container';

  constructor(private toasterService: ToasterService) {
  }

  openStandardError(failedEntity: string, failedOperation: string) {
    const message = this.defaultErrorMessage
      .replace(this.ENTITY, failedEntity)
      .replace(this.OPERATION, failedOperation);
    this.openErrorToast(message);
  }

  openStandardErrorWithCause(failedEntity: string, failedOperation: string, cause: string) {
    const message = this.defaultErrorMessageWithCause
      .replace(this.ENTITY, failedEntity)
      .replace(this.OPERATION, failedOperation)
      .replace(this.CAUSE, cause);
    this.openErrorToast(message);
  }

  openGetEntityErrorWithCause(failedEntity: string, cause: string) {
    const message = this.defaultGetEntityErrorMessage
      .replace(this.ENTITY, failedEntity)
      .replace(this.CAUSE, cause);
    this.openErrorToast(message);
  }

  openStandardSuccess(entity: string, operation: string) {
    const message = this.defaultSuccesMessage
      .replace(this.ENTITY, entity)
      .replace(this.OPERATION, operation);
    this.openSuccessToast(message);
  }

  openFileParseError(filetype: string) {
    const message = this.fileParseErrorMessage
      .replace(this.FILE_TYPE, filetype);
    this.openErrorToast(message);
  }

  openFileParseSuccess(filetype: string) {
    const message = this.fileParseSuccessMessage
      .replace(this.FILE_TYPE, filetype);
    this.openSuccessToast(message);
  }

  openErrorToast(message: string) {
    this.toasterService.pop('error', 'Error', message);
  }

  openSuccessToast(message: string) {
    this.toasterService.pop('success', 'Success', message);
  }

  openInfoToast(message: string) {
    this.toasterService.pop('info', 'Info', message);
  }
}
