import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {
  private readonly apiUrl = 'https://localhost:7139/api/Funcionarios';

  constructor(private http: HttpClient) {}

  listarFuncionarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}