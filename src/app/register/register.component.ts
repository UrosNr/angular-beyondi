import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registrationForm: FormGroup;
  errorMessage: string = '';
  infoMessage: string = '';

  private fb = inject(FormBuilder);
  private auth = inject(AngularFireAuth);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  constructor() {
    this.registrationForm = this.fb.group({
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

  async onSubmit(): Promise<void> {
    if (this.registrationForm.valid) {
        const { email, password } = this.registrationForm.value;

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);

            const newUser: User = {
                uid: userCredential.user?.uid || '',
                email: email,
                isAdmin: false,
                passwordChanged: true
            };

            await this.userService.addUser(newUser);

            this.router.navigate(['/']);
            this.toastr.success('User registered successfully');
        } catch (error) {
          if (error instanceof Error) {
            this.toastr.error(error.message);
          } else {
            this.toastr.error('An unknown error occurred');
          }
        }
    }
}

}
