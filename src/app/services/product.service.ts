// services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user';
import { Product } from '../models/product';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private user: User | null = null;
  private firestore = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);
  private userService = inject(UserService);

  constructor() {
    this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc(user.uid).valueChanges().pipe(
            map((userData: any) => {
              return { uid: user.uid, email: user.email || '', isAdmin: userData?.isAdmin || false } as User;
            })
          );
        } else {
          return [null];
        }
      })
    ).subscribe(user => {
      this.user = user;
    });
  }

  getProducts(): Observable<Product[]> {
    return this.firestore.collection<Product>('products').valueChanges({ idField: 'id' });
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.firestore.collection<Product>('products').doc(id).valueChanges();
  }

  addProduct(product: Product): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('products').doc(id).set({ ...product, id });
  }

  updateProduct(id: string, product: Product): Promise<void> {
    if (this.user?.isAdmin) {
      return this.firestore.collection('products').doc(id).update(product);
    } else {
      return Promise.reject('Unauthorized');
    }
  }

  deleteProduct(id: string): Promise<void> {
    if (this.user?.isAdmin) {
      return this.firestore.collection('products').doc(id).delete();
    } else {
      return Promise.reject('Unauthorized');
    }
  }
}
