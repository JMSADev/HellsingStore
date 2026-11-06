import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private http = inject(HttpClient);

  listarProdutos() {
    return this.http.get<any[]>('https://localhost:7139/api/Produtos');
  }
}
