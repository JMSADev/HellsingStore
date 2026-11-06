import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FuncionariosService {
  private http = inject(HttpClient);

  listarFuncionarios() {
    return this.http.get<any[]>('https://localhost:7139/api/Funcionarios');
  }
}
