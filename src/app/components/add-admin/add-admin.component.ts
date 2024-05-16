import { Component, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../models/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.css']
})
export class AddAdminComponent {
  addAdminForm: FormGroup;

  private fb = inject(FormBuilder);
  private auth = inject(AngularFireAuth);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  constructor() {
    this.addAdminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[A-Z])/), // Uppercase letter
          Validators.pattern(/(?=.*[a-z])/), // Lowercase letter
          Validators.pattern(/(?=.*[0-9].*[0-9].*[0-9])/), // At least 3 numbers
          Validators.pattern(/(?=.*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\])/), // Special character
          Validators.pattern(
            /(?=.*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\].*[!@#$%^&*()_+{}:<>?~\-=[\];',./`|\\])/
          ), // At least 2 special characters
        ],
      ],
    });
  }

  addAdmin(): void {
    const { email, password } = this.addAdminForm.value;

    // Save the current user's email and password before creating a new user
    this.auth.currentUser.then(currentUser => {
      if (currentUser && currentUser.email) {
        const currentUserEmail = currentUser.email;
        const currentUserPassword = prompt('Please enter your password to confirm adding a new admin:');

        if (currentUserPassword !== null) {
          // Create the new user
          this.auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
              const user: User = {
                uid: userCredential.user?.uid || '',
                email: email,
                isAdmin: true,
                passwordChanged: false
              };

              // Store the user data in Firestore
              return this.userService.addUser(user);
            })
            .then(() => {
              // Re-authenticate the original user
              return this.auth.signInWithEmailAndPassword(currentUserEmail, currentUserPassword);
            })
            .then(() => {
              this.toastr.success('Admin added successfully');
              this.router.navigate(['/admin']);
            })
            .catch(error => {
              this.toastr.error('Error adding admin');
              console.error('Error adding admin:', error);
            });
        } else {
          this.toastr.error('Password entry cancelled. Admin not added.');
        }
      } else {
        this.toastr.error('No currently logged in user.');
      }
    }).catch(error => {
      this.toastr.error('Error fetching current user');
      console.error('Error fetching current user:', error);
    });
  }

}
