import { AdminDetailsComponent } from './components/admin-details/admin-details.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProductsComponent } from './pages/products/products.component';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { AddAdminComponent } from './components/add-admin/add-admin.component';
import { passwordChangeGuard } from './guard/password-change.guard';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { adminGuard } from './guard/admin.guard';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard, passwordChangeGuard] },
  { path: 'change-password', component: ChangePasswordComponent , canActivate: [authGuard]},
  { path: 'products', component: ProductsComponent, canActivate: [authGuard, passwordChangeGuard] },
  { path: 'products/new', component: ProductFormComponent, canActivate: [authGuard, passwordChangeGuard]},
  { path: 'products/:id', component: ProductDetailsComponent, canActivate: [authGuard, passwordChangeGuard]},
  { path: 'products/:id/edit', component: ProductFormComponent, canActivate: [authGuard, passwordChangeGuard,adminGuard] },
  { path: 'add-admin', component: AddAdminComponent, canActivate: [authGuard,passwordChangeGuard,adminGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard,passwordChangeGuard,adminGuard] },
  { path: 'admin-details/:uid', component: AdminDetailsComponent, canActivate: [authGuard,passwordChangeGuard,adminGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
