import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);

  listarClientes() {
    return this.http.get<any[]>('https://localhost:7139/api/Clientes');
  }
}
