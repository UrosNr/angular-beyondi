import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AngularFireAuth);
  private firestore = inject(AngularFirestore);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  changePasswordForm: FormGroup;

  constructor() {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [
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

  changePassword(): void {
    if (this.changePasswordForm.valid) {
      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      this.auth.currentUser.then(user => {
        if (user) {
          user.updatePassword(newPassword).then(() => {
            // Update the user's passwordChanged status in Firestore
            this.firestore.collection('users').doc(user.uid).update({ passwordChanged: true }).then(() => {
              this.router.navigate(['/']);
            });
          }).catch(error => {
            this.toastr.error('Error updating password');
          });
        }
      });
    }
  }
}
