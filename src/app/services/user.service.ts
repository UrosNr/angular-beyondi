import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<User>;

  constructor(private firestore: AngularFirestore) {
    this.usersCollection = this.firestore.collection<User>('users');
  }

  getUsers(): Observable<User[]> {
    return this.usersCollection.valueChanges({ idField: 'uid' });
  }

  getAdmins(): Observable<User[]> {
    return this.firestore.collection<User>('users', ref => ref.where('isAdmin', '==', true))
      .valueChanges({ idField: 'uid' });
  }

  getUser(uid: string): Observable<User | undefined> {
    return this.usersCollection.doc<User>(uid).valueChanges();
  }

  addUser(user: User): Promise<void> {
    return this.usersCollection.doc(user.uid).set(user);
  }

  updateUser(user: User): Promise<void> {
    return this.usersCollection.doc(user.uid).update(user);
  }

  deleteUser(uid: string): Promise<void> {
    return this.usersCollection.doc(uid).delete();
  }
}
