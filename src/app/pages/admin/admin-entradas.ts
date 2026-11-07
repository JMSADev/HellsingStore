import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

// Data de hoje no formato yyyy-MM-dd, no fuso do usuário.
const hoje = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const vazio = () => ({ iditem: 0, data: hoje(), quantidade: 1, unidade: 'UN', valor: 0 });

@Component({
  selector: 'app-admin-entradas',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <section class="titulo">
      <h1>Entrada de produtos</h1>
      <p>Ao registrar, o banco atualiza o estoque e o preço de venda do produto.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <h2>Nova entrada</h2>
      <form class="form" (ngSubmit)="salvar()">
        <label>Produto
          <select name="produto" [ngModel]="dados.iditem" (ngModelChange)="escolher($event)">
            <option [ngValue]="0">Selecione...</option>
            @for (p of produtos(); track p.iditem) {
              <option [ngValue]="p.iditem">{{ p.nome }}</option>
            }
          </select>
        </label>
        <label>Data da entrada
          <input name="data" type="date" [(ngModel)]="dados.data" />
        </label>
        <label>Quantidade
          <input name="quantidade" type="number" min="1" step="1" [(ngModel)]="dados.quantidade" />
        </label>
        <label>Unidade
          <input name="unidade" [(ngModel)]="dados.unidade" maxlength="10" />
        </label>
        <label>Valor unitário de entrada (R$)
          <input name="valor" type="number" min="0" step="0.01" [(ngModel)]="dados.valor" />
        </label>
        <div class="acoes">
          <button class="botao" type="submit">Registrar entrada</button>
          <button class="botao secundario" type="button" (click)="limpar()">Limpar</button>
        </div>
      </form>
    </section>

    <section class="painel">
      <h2>Entradas registradas</h2>
      <div class="tabela-container">
        <table>
          <thead><tr><th>Nº</th><th>Produto</th><th>Data</th><th>Quantidade</th><th>Un.</th><th>Valor unitário</th></tr></thead>
          <tbody>
            @for (e of entradas(); track e.identradaProduto) {
              <tr>
                <td>{{ e.identradaProduto }}</td>
                <td>{{ nomeProduto(e.iditem) }}</td>
                <td>{{ e.dataEntradaProduto | date:'dd/MM/yyyy' }}</td>
                <td>{{ e.quantidadeEntrada }}</td>
                <td>{{ e.unidade }}</td>
                <td>{{ e.valorUnitarioEntrada | currency:'BRL' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="vazio">Nenhuma entrada registrada.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
})
export class AdminEntradas {
  private api = inject(AdminService);

  produtos = signal<any[]>([]);
  entradas = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  dados = vazio();

  constructor() {
    this.api.listar('Produtos').subscribe({
      next: dados => this.produtos.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os produtos.'), true)
    });
    this.carregar();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  carregar(): void {
    this.api.listar('EntradasProdutos').subscribe({
      next: dados => this.entradas.set(dados.slice().reverse()), // mais recentes primeiro
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar as entradas.'), true)
    });
  }

  nomeProduto(id: number): string {
    return this.produtos().find(p => p.iditem === id)?.nome ?? '#' + id;
  }

  // Ao escolher o produto, já sugere a unidade dele.
  escolher(id: number): void {
    this.dados.iditem = id;
    const produto = this.produtos().find(p => p.iditem === id);
    if (produto) this.dados.unidade = produto.unidade ?? 'UN';
  }

  limpar(): void {
    this.dados = vazio();
  }

  salvar(): void {
    const d = this.dados;

    if (!d.iditem) return this.aviso('Selecione o produto.', true);
    if (!d.data) return this.aviso('Informe a data da entrada.', true);
    if (!Number.isInteger(d.quantidade) || d.quantidade <= 0) return this.aviso('A quantidade deve ser um número inteiro maior que zero.', true);
    if (!d.unidade.trim()) return this.aviso('Informe a unidade.', true);
    if (!(d.valor >= 0)) return this.aviso('Informe um valor unitário válido.', true);

    const corpo = {
      iditem: d.iditem,
      dataEntradaProduto: d.data,
      quantidadeEntrada: d.quantidade,
      unidade: d.unidade.trim(),
      valorUnitarioEntrada: d.valor
    };

    this.api.salvar('EntradasProdutos', corpo).subscribe({
      next: r => {
        this.aviso(r?.mensagem ?? 'Entrada registrada com sucesso!');
        this.limpar();
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível registrar a entrada.'), true)
    });
  }
}