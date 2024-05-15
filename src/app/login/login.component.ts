import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  infoMessage: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required ]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['reason'] === 'unauthorized') {
        this.infoMessage = 'Please log in to access the requested page.';
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          const returnUrl = '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.toastr.error(err.message);
        },
      });
    }
  }
}
