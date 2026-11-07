import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

const vazio = () => ({ nome: '', descricao: '', idcategoria: 0, preco: 0 });

@Component({
  selector: 'app-admin-servicos',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section class="titulo">
      <h1>Serviços</h1>
      <p>Cadastre, edite e desative serviços. Serviços não têm estoque.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <h2>{{ idEditando ? 'Editar serviço #' + idEditando : 'Novo serviço' }}</h2>
      <form class="form" (ngSubmit)="salvar()">
        <label>Nome
          <input name="nome" [(ngModel)]="dados.nome" maxlength="40" />
        </label>
        <label>Categoria
          <select name="categoria" [(ngModel)]="dados.idcategoria">
            <option [ngValue]="0">Selecione...</option>
            @for (c of categorias(); track c.idcategoria) {
              <option [ngValue]="c.idcategoria">{{ c.categoria }}</option>
            }
          </select>
        </label>
        <label>Preço (R$)
          <input name="preco" type="number" min="0" step="0.01" [(ngModel)]="dados.preco" />
        </label>
        <label class="largo">Descrição
          <textarea name="descricao" rows="2" maxlength="200" [(ngModel)]="dados.descricao"></textarea>
        </label>
        <div class="acoes">
          <button class="botao" type="submit">{{ idEditando ? 'Salvar alterações' : 'Cadastrar' }}</button>
          <button class="botao secundario" type="button" (click)="limpar()">Limpar</button>
        </div>
      </form>
    </section>

    <section class="painel">
      <h2>Serviços ativos</h2>
      <div class="tabela-container">
        <table>
          <thead><tr><th>ID</th><th>Serviço</th><th>Categoria</th><th>Descrição</th><th>Preço</th><th>Ações</th></tr></thead>
          <tbody>
            @for (s of servicos(); track s.iditem) {
              <tr>
                <td>{{ s.iditem }}</td>
                <td>{{ s.nome }}</td>
                <td>{{ s.categoria }}</td>
                <td>{{ s.descricao }}</td>
                <td>{{ s.preco | currency:'BRL' }}</td>
                <td class="col-acoes">
                  <button class="botao mini secundario" type="button" (click)="editar(s)">Editar</button>
                  <button class="botao mini perigo" type="button" (click)="desativar(s)">Desativar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="vazio">Nenhum serviço ativo.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
})
export class AdminServicos {
  private api = inject(AdminService);

  servicos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  idEditando = 0;
  dados = vazio();

  constructor() {
    this.api.listar('Categorias').subscribe({
      next: dados => this.categorias.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar as categorias.'), true)
    });
    this.carregar();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  carregar(): void {
    this.api.listar('Servicos').subscribe({
      next: dados => this.servicos.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os serviços.'), true)
    });
  }

  editar(s: any): void {
    this.idEditando = s.iditem;
    this.dados = { nome: s.nome, descricao: s.descricao ?? '', idcategoria: s.idcategoria, preco: s.preco };
    this.msg.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limpar(): void {
    this.idEditando = 0;
    this.dados = vazio();
  }

  salvar(): void {
    const d = this.dados;

    if (!d.nome.trim()) return this.aviso('Informe o nome do serviço.', true);
    if (!d.idcategoria) return this.aviso('Escolha uma categoria.', true);
    if (!(d.preco >= 0)) return this.aviso('Informe um preço válido.', true);
    if (!d.descricao.trim()) return this.aviso('Informe a descrição do serviço.', true);

    const editando = this.idEditando;

    this.api.salvar('Servicos', { ...d, nome: d.nome.trim() }, editando || undefined).subscribe({
      next: () => {
        this.aviso(editando ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
        this.limpar();
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível salvar o serviço.'), true)
    });
  }

  desativar(s: any): void {
    if (!confirm(`Desativar o serviço "${s.nome}"?`)) return;

    this.api.remover('Servicos', s.iditem).subscribe({
      next: () => {
        this.aviso('Serviço desativado com sucesso!');
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível desativar o serviço.'), true)
    });
  }
}