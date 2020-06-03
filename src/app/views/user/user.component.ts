import {Component, OnInit} from '@angular/core';
import {User} from '../../_models/user';
import {UserService} from '../../_services/user.service';
import {Router} from '@angular/router';
import Utils from '../../_utils/Utils';
import {ToastManagerService} from '../../_services/toast-manager.service';
import {TimeoutComponent} from '../../timeout/timeout.component';
import {ConfirmDialogComponent} from '../../dialog/confirm/confirm-dialog.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']

})
export class UserComponent extends TimeoutComponent implements OnInit {

  public users: User[];
  public editedUsers: User[];
  public filter: string;
  sortedBy: string;
  ascending: boolean;
  public show: boolean;
  selectedRow: Function;
  private DELETE_OPERATION = this.toastManagerService.DELETE_OPERATION;
  modalRef: BsModalRef;

  constructor(private userService: UserService, private router: Router, private toastManagerService: ToastManagerService,
              private modalService: BsModalService, private sidebarNotifierService: SidebarNotifierService) {
    super();
    this.sidebarNotifierService.notifyProjectAndModel(null, null);
  }

  ngOnInit() {
    this.getUsers();
    this.show = false;
  }

  openConfirmationDialog(user: User) {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.message = 'Are sure you want to delete this user?';
    this.modalRef.content.successMessage = 'Confirm';
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.del(user);
      }
    });
  }

  selectUser(index): void {
    this.selectedRow = index;
  }

  getUsers() {
    const subscription = this.userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.editedUsers = users;
      this.cancelTimeout();
    });
    this.waitForTimeOut(subscription);
  }

  edit(user: User) {
    this.router.navigate(['/edit-user/' + user.id]);
  }

  del(user: User) {
    this.userService.deleteUser(user.id).subscribe(() => {
      this.getUsers();
    }, e => {
      console.log(e.valueOf());
      this.toastManagerService.openStandardErrorWithCause(this.toastManagerService.USER_ENTITY, this.DELETE_OPERATION,
        'Be sure that the user does not belong to a project');
    }, () => {
      this.toastManagerService.openStandardSuccess(this.toastManagerService.USER_ENTITY, this.DELETE_OPERATION);
    });
  }

  sortByName(invert: boolean = true) {
    if (this.sortedBy !== 'name') {
      this.sortedBy = 'name';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedUsers = this.editedUsers.sort((a, b) => {
      const entryA = a as User;
      const entryB = b as User;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.name, entryB.name);
      } else {
        return Utils.CompareStrings(entryB.name, entryA.name);
      }
    });
  }

  sortByRole(invert: boolean = true) {
    if (this.sortedBy !== 'Role') {
      this.sortedBy = 'Role';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedUsers = this.editedUsers.sort((a, b) => {
      const entryA = a as User;
      const entryB = b as User;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.role, entryB.role);
      } else {
        return Utils.CompareStrings(entryB.role, entryA.role);
      }
    });
  }

  filterTable() {
    this.editedUsers = this.users.filter(project => {
      return Utils.searchFilterRecursive(project, this.filter, false);
    });

    if (Utils.VerifyObject(this.sortedBy) && this.sortedBy !== '') {
      switch (this.sortedBy) {
        case 'name': {
          this.sortByName(false);
          break;
        }
        case 'Role': {
          this.sortByRole(false);
          break;
        }
      }
    }
  }

  clearFilter() {
    this.filter = '';
    this.filterTable();
  }
}
