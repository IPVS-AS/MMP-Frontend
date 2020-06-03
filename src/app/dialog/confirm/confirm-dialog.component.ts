import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  message: string;
  successMessage: string;
  public onClose: Subject<boolean>;
  title: string;
  needsInputField: boolean;
  value: string;

  public returnValue: Subject<string>;

  constructor(public modalRef: BsModalRef) {}

  ngOnInit() {
    this.onClose = new Subject();
    this.returnValue = new Subject<string>();
    this.needsInputField = false;
    this.title = 'Confirm';
    this.value = null;
}

  confirm() {
    this.onClose.next(true);
    if (this.needsInputField === true) {
      this.returnValue.next(this.value);
    }
    this.modalRef.hide();
  }
}

