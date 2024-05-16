import { Injectable, OnDestroy, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Subject, from, takeUntil } from 'rxjs';
import { User } from '../models/user';
import { Product } from '../models/product';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {
  private user: User | null = null;
  private firestore = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();

  constructor() {
    this.auth.authState.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.userService.getUser(user.uid).subscribe(userData => {
          if (userData) {
            this.user = userData;
          } else {
            this.user = null;
          }
        });
      } else {
        this.user = null;
      }
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
