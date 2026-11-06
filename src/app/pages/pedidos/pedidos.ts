import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';

// O banco guarda o status em 1 letra.
const STATUS: { [codigo: string]: string } = {
  A: 'Aberto', P: 'Em processamento', C: 'Concluído', X: 'Cancelado'
};

// Classe de cor de cada status (definidas no pedidos.css).
const CLASSES: { [codigo: string]: string } = {
  A: 'aberto', P: 'processando', C: 'concluido', X: 'cancelado'
};

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos {
  private pedidosService = inject(PedidosService);
  private cdr = inject(ChangeDetectorRef);

  clientes: any[] = [];
  pedidos: any[] = [];
  idPessoa = 0;
  mensagem = 'Escolha um cliente para visualizar os pedidos.';

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

  // Chamado quando um cliente é escolhido na lista.
  carregarPedidos(idPessoa: number): void {
    this.idPessoa = idPessoa;
    this.pedidos = [];

    if (!idPessoa) {
      this.mensagem = 'Escolha um cliente para visualizar os pedidos.';
      return;
    }

    this.mensagem = '⏳ Carregando pedidos...';

    this.pedidosService.listarPedidosDoCliente(idPessoa).subscribe({
      next: dados => {
        this.pedidos = dados;
        this.mensagem = dados.length ? '' : 'Este cliente ainda não possui pedidos.';
        this.cdr.detectChanges();
      },
      error: erro => {
        this.mensagem = erro.error?.mensagem ?? 'Não foi possível carregar os pedidos.';
        this.cdr.detectChanges();
      }
    });
  }

  nomeStatus(codigo: string): string {
    return STATUS[codigo] ?? codigo;
  }

  classeStatus(codigo: string): string {
    return CLASSES[codigo] ?? '';
  }
}
