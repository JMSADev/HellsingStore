import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ItemCarrinho } from './carrinho.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7139/api/Pedidos';


  // Cria o pedido com todos os itens de uma vez.
  criarPedido(
    idPessoa: number,
    itens: ItemCarrinho[]
  ) {

    return this.http.post<any>(
      this.apiUrl,
      {
        idpessoa: idPessoa,

        itens: itens.map(item => ({
          iditem: item.produto.iditem,
          quantidade: item.quantidade
        }))
      }
    );

  }


  // Busca os pedidos de um cliente.
  listarPedidosDoCliente(idPessoa: number) {

    return this.http.get<any[]>(
      `${this.apiUrl}/cliente/${idPessoa}`
    );

  }

}