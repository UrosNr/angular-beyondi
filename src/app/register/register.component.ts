import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private firestore = inject(AngularFirestore);
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

  ngOnInit() {}

  async onSubmit() {
    if (this.registrationForm.valid) {
        const { email, password } = this.registrationForm.value;

        try {
            // Create user in authentication
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);

            // Create user object for Firestore
            const newUser: User = {
                uid: userCredential.user?.uid || '',
                email: email,
                isAdmin: false,
                passwordChanged: true
            };

            // Insert user into Firestore
            await this.firestore.collection<User>('users').doc(newUser.uid).set(newUser);

            // Redirect after successful registration
            this.router.navigate(['/']);

            // Show success message
            this.toastr.success('User registered successfully');
        } catch (error) {
            // Handle error
            // this.toastr.error(error.message);
        }
    }
}

}
