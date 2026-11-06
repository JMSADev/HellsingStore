import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CarrinhoService, ItemCarrinho } from '../../services/carrinho.service';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  private pedidos = inject(PedidosService);
  private cdr = inject(ChangeDetectorRef);
  carrinho = inject(CarrinhoService); // a tela lê os itens direto daqui

  clientes: any[] = [];
  mensagem = '';
  finalizando = false;
  idPessoa = 0; // cliente escolhido na lista

  constructor() {
    inject(ClientesService).listarClientes().subscribe({
      next: dados => {
        this.clientes = dados;
        this.cdr.detectChanges(); // atualiza a tela
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar os clientes. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }

  aumentar(item: ItemCarrinho): void {
    this.mensagem = this.carrinho.adicionar(item.produto) ? '' : 'Você atingiu a quantidade disponível em estoque.';
  }

  diminuir(item: ItemCarrinho): void {
    this.carrinho.diminuir(item);
    this.mensagem = '';
  }

  remover(item: ItemCarrinho): void {
    this.carrinho.remover(item);
    this.mensagem = 'Produto removido do carrinho.';
  }

  limpar(): void {
    this.carrinho.limpar();
    this.mensagem = 'Carrinho esvaziado.';
  }

  // async/await: o "await" espera a API responder antes de ir para a próxima linha.
  async finalizarCompra(): Promise<void> {
    if (!this.idPessoa) {
      this.mensagem = 'Escolha o cliente antes de finalizar a compra.';
      return;
    }

    this.finalizando = true;
    this.mensagem = 'Finalizando compra...';

    try {
      await firstValueFrom(this.pedidos.criarPedido(this.idPessoa, this.carrinho.itens));
      this.carrinho.limpar();
      this.mensagem = 'Compra realizada com sucesso! Seu pedido foi registrado.';
    } catch (erro: any) {
      // Mostra a mensagem enviada pela API (ex.: "Estoque insuficiente...").
      this.mensagem = erro.error?.mensagem ?? 'Não foi possível finalizar a compra. Verifique se a API está funcionando.';
    }

    this.finalizando = false;
    this.cdr.detectChanges(); // atualiza a tela depois da espera
  }
}
