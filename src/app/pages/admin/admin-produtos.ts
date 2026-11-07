import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

const vazio = () => ({
  nome: '', descricao: '', idcategoria: 0,
  preco: 0, precoVenda: 0, unidade: 'UN', codigoPreco: 1
});

@Component({
  selector: 'app-admin-produtos',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section class="titulo">
      <h1>Produtos</h1>
      <p>Cadastre, edite e desative produtos. O preço de venda é recalculado pelo banco nas entradas.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <h2>{{ idEditando ? 'Editar produto #' + idEditando : 'Novo produto' }}</h2>
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
        <label>Unidade
          <input name="unidade" [(ngModel)]="dados.unidade" maxlength="10" />
        </label>
        <label>Código de preço
          <input name="codigoPreco" type="number" min="1" [(ngModel)]="dados.codigoPreco" />
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
      <h2>Produtos ativos</h2>
      <div class="tabela-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Preço de venda</th><th>Un.</th><th>Estoque</th><th>Ações</th></tr>
          </thead>
          <tbody>
            @for (p of produtos(); track p.iditem) {
              <tr>
                <td>{{ p.iditem }}</td>
                <td>{{ p.nome }}</td>
                <td>{{ p.categoria }}</td>
                <td>{{ p.preco | currency:'BRL' }}</td>
                <td>{{ p.precoVenda | currency:'BRL' }}</td>
                <td>{{ p.unidade }}</td>
                <td>{{ p.quantidadeEstoque ?? 0 }}</td>
                <td class="col-acoes">
                  <button class="botao mini secundario" type="button" (click)="editar(p)">Editar</button>
                  <button class="botao mini perigo" type="button" (click)="desativar(p)">Desativar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="vazio">Nenhum produto ativo.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
})
export class AdminProdutos {
  private api = inject(AdminService);

  produtos = signal<any[]>([]);
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
    this.api.listar('Produtos').subscribe({
      next: dados => this.produtos.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os produtos.'), true)
    });
  }

  editar(p: any): void {
    // A lista traz o nome da categoria; aqui descobrimos o id dela.
    const cat = this.categorias().find(c => c.categoria === p.categoria);

    this.idEditando = p.iditem;
    this.dados = {
      nome: p.nome,
      descricao: p.descricao ?? '',
      idcategoria: cat?.idcategoria ?? 0,
      preco: p.preco,
      precoVenda: p.precoVenda ?? p.preco,
      unidade: p.unidade ?? 'UN',
      codigoPreco: 1
    };
    this.msg.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limpar(): void {
    this.idEditando = 0;
    this.dados = vazio();
  }

  salvar(): void {
    const d = this.dados;

    if (!d.nome.trim()) return this.aviso('Informe o nome do produto.', true);
    if (!d.idcategoria) return this.aviso('Escolha uma categoria.', true);
    if (!(d.preco >= 0)) return this.aviso('Informe um preço válido.', true);
    if (!d.unidade.trim()) return this.aviso('Informe a unidade do produto.', true);
    if (!d.descricao.trim()) return this.aviso('Informe a descrição do produto.', true);

    const editando = this.idEditando;
    // Produto novo: preço de venda começa igual ao preço. O banco recalcula nas entradas.
    const corpo = { ...d, nome: d.nome.trim(), precoVenda: editando ? d.precoVenda : d.preco };

    this.api.salvar('Produtos', corpo, editando || undefined).subscribe({
      next: () => {
        this.aviso(editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        this.limpar();
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível salvar o produto.'), true)
    });
  }

  desativar(p: any): void {
    if (!confirm(`Desativar o produto "${p.nome}"?`)) return;

    this.api.remover('Produtos', p.iditem).subscribe({
      next: () => {
        this.aviso('Produto desativado com sucesso!');
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível desativar o produto.'), true)
    });
  }
}