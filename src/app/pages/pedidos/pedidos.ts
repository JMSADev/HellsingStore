import {
    Component,
    inject,
    ChangeDetectorRef
  } from '@angular/core';
  
  import { CommonModule } from '@angular/common';
  import { RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  
  import { PedidosService } from '../../services/pedidos.service';
  import { ClientesService } from '../../services/clientes.service';
  
  @Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [
      CommonModule,
      RouterLink,
      FormsModule
    ],
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.css'
  })
  export class Pedidos {
  
    private pedidosService = inject(PedidosService);
    private clientesService = inject(ClientesService);
    private cdr = inject(ChangeDetectorRef);
  
  
    clientes: any[] = [];
  
    pedidos: any[] = [];
  
    idPessoa = 0;
  
    carregandoClientes = false;
  
    carregandoPedidos = false;
  
    mensagem = '';
  
  
    constructor() {
  
      this.carregarClientes();
  
    }
  
  
    // Carrega os clientes para podermos escolher um.
    carregarClientes(): void {
  
      this.carregandoClientes = true;
  
      this.clientesService.listarClientes().subscribe({
  
        next: (dados) => {
  
          this.clientes = dados;
  
          this.carregandoClientes = false;
  
          this.cdr.detectChanges();
  
        },
  
        error: (erro) => {
  
          console.error(
            'Erro ao carregar clientes:',
            erro
          );
  
          this.carregandoClientes = false;
  
          this.mensagem =
            'Não foi possível carregar os clientes.';
  
          this.cdr.detectChanges();
  
        }
  
      });
  
    }
  
  
    // Busca os pedidos do cliente escolhido.
    carregarPedidos(): void {
  
      if (!this.idPessoa) {
  
        this.pedidos = [];
  
        this.mensagem =
          'Escolha um cliente para visualizar os pedidos.';
  
        return;
  
      }
  
      this.carregandoPedidos = true;
  
      this.mensagem = '';
  
      this.pedidosService
        .listarPedidosDoCliente(this.idPessoa)
        .subscribe({
  
          next: (dados) => {
  
            console.log(
              'Pedidos recebidos:',
              dados
            );
  
            this.pedidos = dados;
  
            this.carregandoPedidos = false;
  
            if (dados.length === 0) {
  
              this.mensagem =
                'Este cliente ainda não possui pedidos.';
  
            }
  
            this.cdr.detectChanges();
  
          },
  
          error: (erro) => {
  
            console.error(
              'Erro ao carregar pedidos:',
              erro
            );
  
            this.pedidos = [];
  
            this.carregandoPedidos = false;
  
            this.mensagem =
              erro.error?.mensagem ??
              'Não foi possível carregar os pedidos.';
  
            this.cdr.detectChanges();
  
          }
  
        });
  
    }
  
  
    // Converte o código do status para um texto.
    obterStatus(status: string): string {
  
      switch (status) {
  
        case 'A':
          return 'Aberto';
  
        case 'P':
          return 'Em processamento';
  
        case 'C':
          return 'Concluído';
  
        case 'X':
          return 'Cancelado';
  
        default:
          return status;
  
      }
  
    }
  
  
    // Define a classe visual do status.
    obterClasseStatus(status: string): string {
  
      switch (status) {
  
        case 'A':
          return 'aberto';
  
        case 'P':
          return 'processando';
  
        case 'C':
          return 'concluido';
  
        case 'X':
          return 'cancelado';
  
        default:
          return '';
  
      }
  
    }
  
  }