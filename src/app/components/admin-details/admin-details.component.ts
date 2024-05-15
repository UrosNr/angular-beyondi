import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-details',
  templateUrl: './admin-details.component.html',
  styleUrls: ['./admin-details.component.css']
})
export class AdminDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AngularFireAuth);
  private firestore = inject(AngularFirestore);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  adminUid: string = '';
  adminDetailsForm: FormGroup;
  user: User | undefined = undefined;

  constructor() {
    this.adminDetailsForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[A-Z])/), // Uppercase letter
        Validators.pattern(/(?=.*[a-z])/), // Lowercase letter
        Validators.pattern(/(?=.*\d.*\d.*\d)/), // At least 3 numbers
        Validators.pattern(/(?=.*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\\\])/), // Special character
        Validators.pattern(/(?=.*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\\\].*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\\\])/) // At least 2 special characters
      ]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.adminUid = params['uid'];
      this.firestore.collection('users').doc(this.adminUid).valueChanges().subscribe((admin: any) => {
        if (admin) {
          this.adminDetailsForm.patchValue({
            email: admin.email
          });
        }
      });
    });
  }

  async updateAdminDetails(): Promise<void> {
    if (this.adminDetailsForm.invalid) {
        return;
    }

    const newEmail = this.adminDetailsForm.get('email')?.value;
    const newPassword = this.adminDetailsForm.get('password')?.value;

    try {
        await this.auth.currentUser.then(async user => {
            if (user) {
                await user.updateEmail(newEmail);
                await user.updatePassword(newPassword);
                this.toastr.success('Admin details updated successfully');
                this.router.navigate(['/']);
            }
        });

        const userDoc = this.firestore.collection<User>('users').doc(this.adminUid);
        const userSnapshot = await userDoc.ref.get();
        const user = userSnapshot.data() as User | undefined;

        if (user) {
            user.email = newEmail;
            await userDoc.update(user);
            this.toastr.success('User details updated successfully');
        } else {
            this.toastr.error('User not found');
        }
    } catch (error) {
        // this.toastr.error(error);
    }
}

}
