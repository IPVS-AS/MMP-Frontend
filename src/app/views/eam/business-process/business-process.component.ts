import {Component, Inject} from '@angular/core';
import {BusinessProcess} from '../../../_models/eam/business-process';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-business-process',
  templateUrl: './business-process.component.html',
  styleUrls: ['./business-process.component.css']
})
export class BusinessProcessComponent {

  businessProcess: BusinessProcess;
  editMode: boolean;

  constructor(public dialogRef: MatDialogRef<BusinessProcessComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editMode = data.editMode;
    this.businessProcess = data.businessProcess;
  }

  submit() {
    this.dialogRef.close(this.businessProcess);
  }

  cancel() {
    this.dialogRef.close();
  }

}
