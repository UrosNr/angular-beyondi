import { Component, OnInit, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  admins: User[] = [];
  private firestore = inject(AngularFirestore);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.firestore.collection<User>('users', ref => ref.where('isAdmin', '==', true))
      .valueChanges({ idField: 'uid' })
      .subscribe(admins => {
        this.admins = admins;
      });
  }

  deleteAdmin(uid: string): void {
    this.firestore.collection('users').doc(uid).delete().then(() => {
      this.toastr.success('Admin deleted successfully');
    }).catch(error => {
      this.toastr.error('Error deleting admin');
    });
  }

  addAdmin(): void{
    this.router.navigate(['/add-admin']);
  }


}
