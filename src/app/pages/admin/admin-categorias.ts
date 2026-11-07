import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

 /*html*/
@Component({
  selector: 'app-admin-categorias',
  imports: [FormsModule],
  template: `
    <section class="titulo">
      <h1>Categorias</h1>
      <p>Categorias em uso por produtos ou serviços não podem ser excluídas.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <h2>{{ idEditando ? 'Editar categoria #' + idEditando : 'Nova categoria' }}</h2>
      <form class="form" (ngSubmit)="salvar()">
        <label class="largo">Nome da categoria
          <input name="nome" [(ngModel)]="nome" maxlength="35" />
        </label>
        <div class="acoes">
          <button class="botao" type="submit">{{ idEditando ? 'Salvar alterações' : 'Cadastrar' }}</button>
          <button class="botao secundario" type="button" (click)="limpar()">Limpar</button>
        </div>
      </form>
    </section>

    <section class="painel">
      <h2>Categorias cadastradas</h2>
      <div class="tabela-container">
        <table>
          <thead><tr><th>ID</th><th>Categoria</th><th>Ações</th></tr></thead>
          <tbody>
            @for (c of categorias(); track c.idcategoria) {
              <tr>
                <td>{{ c.idcategoria }}</td>
                <td>{{ c.categoria }}</td>
                <td class="col-acoes">
                  <button class="botao mini secundario" type="button" (click)="editar(c)">Editar</button>
                  <button class="botao mini perigo" type="button" (click)="excluir(c)">Excluir</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="vazio">Nenhuma categoria cadastrada.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
  /*TS*/
})
export class AdminCategorias {
  private api = inject(AdminService);

  categorias = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  idEditando = 0;
  nome = '';

  constructor() {
    this.carregar();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  carregar(): void {
    this.api.listar('Categorias').subscribe({
      next: dados => this.categorias.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar as categorias.'), true)
    });
  }

  editar(c: any): void {
    this.idEditando = c.idcategoria;
    this.nome = c.categoria;
    this.msg.set(null);
  }

  limpar(): void {
    this.idEditando = 0;
    this.nome = '';
  }

  salvar(): void {
    if (!this.nome.trim()) {
      this.aviso('Informe o nome da categoria.', true);
      return;
    }

    const editando = this.idEditando;
    this.api.salvar('Categorias', { categoria: this.nome.trim() }, editando || undefined).subscribe({
      next: () => {
        this.aviso(editando ? 'Categoria atualizada com sucesso!' : 'Categoria cadastrada com sucesso!');
        this.limpar();
        this.carregar();
      },
      error: e => this.aviso(this.api.erro(e, 'Não foi possível salvar a categoria.'), true)
    });
  }

  excluir(c: any): void {
    if (!confirm(`Excluir a categoria "${c.categoria}"?`)) return;

    this.api.remover('Categorias', c.idcategoria).subscribe({
      next: () => {
        this.aviso('Categoria excluída com sucesso!');
        this.carregar();
      },
      // Aqui aparece a mensagem de "categoria em uso" que a API devolve (409).
      error: e => this.aviso(this.api.erro(e, 'Não foi possível excluir a categoria.'), true)
    });
  }
}