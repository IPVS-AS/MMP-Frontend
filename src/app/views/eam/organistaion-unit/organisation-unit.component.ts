import {Component, Inject} from '@angular/core';
import {OrganisationUnit} from '../../../_models/eam/organisation-unit';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-organisation-unit',
  templateUrl: './organisation-unit.component.html',
  styleUrls: ['./organisation-unit.component.css']
})
export class OrganisationUnitComponent {

  editMode: boolean;
  organisationUnit: OrganisationUnit;

  constructor(public dialogRef: MatDialogRef<OrganisationUnitComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editMode = data.editMode;
    this.organisationUnit = data.organisationUnit;
  }

  submit() {
    this.dialogRef.close(this.organisationUnit);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
