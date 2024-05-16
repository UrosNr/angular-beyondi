import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-details',
  templateUrl: './admin-details.component.html',
  styleUrls: ['./admin-details.component.css']
})
export class AdminDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AngularFireAuth);
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
      this.userService.getUser(this.adminUid).subscribe((admin: any) => {
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
      const user = await this.auth.currentUser;
      if (user) {
        await user.updateEmail(newEmail);
        await user.updatePassword(newPassword);

        const adminUser: User | undefined = await firstValueFrom(this.userService.getUser(this.adminUid));
        if (adminUser) {
          adminUser.email = newEmail;
          await this.userService.updateUser(adminUser);
          this.toastr.success('Admin details updated successfully');
          this.router.navigate(['/']);
        } else {
          this.toastr.error('Admin user not found');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.toastr.error(error.message);
      } else {
        this.toastr.error('An unknown error occurred');
      }
    }
  }

}
