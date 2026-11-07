import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

// O banco guarda o status em 1 letra.
const STATUS: Record<string, string> = { A: 'Aberto', P: 'Em processamento', C: 'Concluído', X: 'Cancelado' };
const CLASSES: Record<string, string> = { A: 'aberto', P: 'processando', C: 'concluido', X: 'cancelado' };

// Botões mostrados em cada situação (o backend valida as transições de novo).
const ACOES: Record<string, { texto: string; status: string; perigo?: boolean }[]> = {
  A: [
    { texto: 'Iniciar processamento', status: 'Em processamento' },
    { texto: 'Cancelar pedido', status: 'Cancelado', perigo: true }
  ],
  P: [
    { texto: 'Concluir pedido', status: 'Concluido' },
    { texto: 'Cancelar pedido', status: 'Cancelado', perigo: true }
  ]
};

@Component({
  selector: 'app-admin-pedidos',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <section class="titulo">
      <h1>Pedidos</h1>
      <p>Acompanhe os pedidos e altere a situação: Aberto → Em processamento → Concluído (ou Cancelado).</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <div class="form">
        <label>Situação
          <select name="filtro" [ngModel]="filtro" (ngModelChange)="mudarFiltro($event)">
            <option value="Aberto">Em aberto</option>
            <option value="Em processamento">Em processamento</option>
            <option value="Concluido">Concluído</option>
            <option value="Cancelado">Cancelado</option>
            <option value="">Todos</option>
          </select>
        </label>
        <label>Abrir pedido pelo número
          <input name="id" type="number" min="1" [(ngModel)]="idBusca" placeholder="Ex.: 5" />
        </label>
        <div class="acoes">
          <button class="botao" type="button" (click)="buscarPorId()">Buscar pelo número</button>
          <button class="botao secundario" type="button" (click)="carregar()">Atualizar lista</button>
        </div>
      </div>
    </section>

    @for (p of pedidos(); track p.idatendimento) {
      <article class="painel">
        <div class="pedido-topo">
          <div>
            <h2>Pedido #{{ p.idatendimento }}</h2>
            <p>Cliente #{{ p.idpessoa }} · {{ p.cliente }} · {{ p.dataAtendimento | date:'dd/MM/yyyy' }}</p>
          </div>
          <div class="pedido-total">
            <span class="status" [class]="classe(p.statusAtendimento)">{{ nome(p.statusAtendimento) }}</span>
            <strong>{{ p.total | currency:'BRL' }}</strong>
          </div>
        </div>

        <div class="tabela-container">
          <table>
            <thead>
              <tr><th>Item</th><th>Qtd.</th><th>Valor unit.</th><th>Subtotal</th><th>Funcionário</th><th>Cargo</th></tr>
            </thead>
            <tbody>
              @for (i of p.itens; track i.iditem) {
                <tr>
                  <td>{{ i.item }}</td>
                  <td>{{ i.quantidade }}</td>
                  <td>{{ i.valorUnitario | currency:'BRL' }}</td>
                  <td>{{ i.quantidade * i.valorUnitario | currency:'BRL' }}</td>
                  <td>{{ i.funcionario }}</td>
                  <td>{{ i.cargo }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="acoes-pedido">
          @for (a of acoes(p.statusAtendimento); track a.status) {
            <button class="botao mini" [class.perigo]="a.perigo" type="button" (click)="mudar(p, a)">{{ a.texto }}</button>
          } @empty {
            <span class="vazio">Pedido finalizado, sem ações disponíveis.</span>
          }
        </div>
      </article>
    } @empty {
      <p class="vazio">Nenhum pedido encontrado.</p>
    }
  `,
  styleUrl: './admin.css'
})
export class AdminPedidos {
  private api = inject(AdminService);

  pedidos = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  filtro = 'Aberto'; // a tela já abre mostrando os pedidos em aberto
  idBusca: number | null = null;

  constructor() {
    this.carregar();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  nome(codigo: string): string { return STATUS[codigo] ?? codigo; }
  classe(codigo: string): string { return CLASSES[codigo] ?? ''; }
  acoes(codigo: string) { return ACOES[codigo] ?? []; }

  mudarFiltro(valor: string): void {
    this.filtro = valor;
    this.carregar();
  }

  carregar(): void {
    this.idBusca = null;
    this.api.listarPedidos(this.filtro).subscribe({
      next: dados => {
        this.pedidos.set(dados);
        this.msg.set(null);
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os pedidos.'), true)
    });
  }

  buscarPorId(): void {
    if (!this.idBusca) {
      this.aviso('Informe o número do pedido.', true);
      return;
    }

    this.api.buscar('Pedidos', this.idBusca).subscribe({
      next: pedido => {
        this.pedidos.set([pedido]);
        this.msg.set(null);
      },
      error: e => {
        this.pedidos.set([]);
        this.aviso(this.api.erro(e, 'Não foi possível buscar o pedido.'), true);
      }
    });
  }

  mudar(p: any, acao: { texto: string; status: string }): void {
    if (!confirm(`Alterar o pedido #${p.idatendimento} para "${acao.status}"?`)) return;

    this.api.atualizarStatus(p.idatendimento, acao.status).subscribe({
      next: () => {
        this.aviso(`Pedido #${p.idatendimento} atualizado com sucesso!`);
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível alterar a situação.'), true)
    });
  }
}