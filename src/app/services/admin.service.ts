import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'https://localhost:7139/api';

// Um serviço só para todas as telas do painel administrativo.
// "recurso" é o nome do controller: 'Produtos', 'Servicos', 'Categorias', 'Estoque'...
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  listar(recurso: string) {
    return this.http.get<any[]>(`${API}/${recurso}`);
  }

  buscar(recurso: string, id: number) {
    return this.http.get<any>(`${API}/${recurso}/${id}`);
  }

  // Sem id cadastra (POST); com id atualiza (PUT).
  salvar(recurso: string, dados: any, id?: number) {
    return id
      ? this.http.put<any>(`${API}/${recurso}/${id}`, dados)
      : this.http.post<any>(`${API}/${recurso}`, dados);
  }

  remover(recurso: string, id: number) {
    return this.http.delete<any>(`${API}/${recurso}/${id}`);
  }

  resumo() {
    return this.http.get<any>(`${API}/Resumo`);
  }

  listarPedidos(status: string) {
    return this.http.get<any[]>(`${API}/Pedidos`, { params: status ? { status } : {} });
  }

  atualizarStatus(id: number, status: string) {
    return this.http.put<any>(`${API}/Pedidos/${id}/status`, { status });
  }

  // Descobre a melhor mensagem de erro para mostrar ao usuário.
  erro(e: any, padrao: string): string {
    if (e?.status === 0) return 'Não foi possível conectar à API. Verifique se ela está funcionando.';
    if (e?.error?.mensagem) return e.error.mensagem;
    if (e?.error?.errors) return (Object.values(e.error.errors) as any[]).flat().join(' ');
    return padrao;
  }
}