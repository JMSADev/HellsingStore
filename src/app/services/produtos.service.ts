import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private http = inject(HttpClient);

  listarProdutos() {
    return this.http.get<any[]>('https://localhost:7139/api/Produtos');
  }

  // Produtos e serviços juntos, cada um marcado com tipo 'P' ou 'S'.
  listarTudo() {
    return forkJoin([
      this.http.get<any[]>('https://localhost:7139/api/Produtos'),
      this.http.get<any[]>('https://localhost:7139/api/Servicos')
    ]).pipe(
      map(([produtos, servicos]) => [
        ...produtos.map(p => ({ ...p, tipo: 'P' })),
        ...servicos.map(s => ({ ...s, tipo: 'S' }))
      ])
    );
  }
}