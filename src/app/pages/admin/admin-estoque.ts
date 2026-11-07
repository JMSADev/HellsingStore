import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-estoque',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section class="titulo">
      <h1>Estoque</h1>
      <p>Consulte todo o estoque ou pesquise pelo ID do item.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <form class="form" (ngSubmit)="buscar()">
        <label>ID do item
          <input name="id" type="number" min="1" [(ngModel)]="idBusca" placeholder="Ex.: 3" />
        </label>
        <div class="acoes">
          <button class="botao" type="submit">Buscar</button>
          <button class="botao secundario" type="button" (click)="limpar()">Ver todos</button>
        </div>
      </form>
    </section>

    <section class="painel">
      <div class="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID item</th><th>Item</th><th>Descrição</th><th>Preço</th><th>Preço de venda</th>
              <th>Unidade</th><th>Categoria</th><th>Quantidade</th><th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            @for (e of itens(); track e.iditem) {
              <tr>
                <td>{{ e.iditem }}</td>
                <td>{{ e.item }}</td>
                <td>{{ e.descricaoItem }}</td>
                <td>{{ e.preco | currency:'BRL' }}</td>
                <td>{{ e.precoVenda | currency:'BRL' }}</td>
                <td>{{ e.unidade }}</td>
                <td>{{ e.categoria }}</td>
                <td>{{ e.quantidadeEstoque }}</td>
                <td><span class="status" [class.inativo]="!e.ativo">{{ e.ativo ? 'Sim' : 'Não' }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="vazio">Nenhum registro de estoque encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
})
export class AdminEstoque {
  private api = inject(AdminService);

  itens = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  idBusca: number | null = null;

  constructor() {
    this.carregar();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  carregar(): void {
    this.api.listar('Estoque').subscribe({
      next: dados => this.itens.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar o estoque.'), true)
    });
  }

  buscar(): void {
    if (!this.idBusca) {
      this.limpar();
      return;
    }

    this.api.buscar('Estoque', this.idBusca).subscribe({
      next: item => {
        this.itens.set([item]);
        this.msg.set(null);
      },
      // 404: a API manda "Estoque não encontrado para este item."
      error: e => {
        this.itens.set([]);
        this.aviso(this.api.erro(e, 'Não foi possível consultar o estoque.'), true);
      }
    });
  }

  limpar(): void {
    this.idBusca = null;
    this.msg.set(null);
    this.carregar();
  }
}