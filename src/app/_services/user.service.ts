import {Injectable} from '@angular/core';
import {User} from '../_models/user';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ApiProviderService} from './api-provider.service';
import {Observable} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private provider: ApiProviderService) {
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.provider.buildUserUrl(null));
  }

  deleteAllUsers(): Observable<{}> {
    return this.http.delete(this.provider.buildUserUrl(null));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(this.provider.buildUserUrl(id));
  }

  registerUser(user: User): Observable<User> {
    return this.http.post<User>(this.provider.buildUserUrl(null), user, httpOptions);
  }

  register(user: User) {
    return this.http.post(`/users/register`, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(this.provider.buildUserUrl(user.id), user, httpOptions);
  }

  deleteUser(id: string): Observable<{}> {
    return this.http.delete(this.provider.buildUserUrl(id));
  }
}
