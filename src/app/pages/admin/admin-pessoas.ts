import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-pessoas',
  imports: [FormsModule],
  template: `
    <section class="titulo">
      <h1>Clientes e funcionários</h1>
      <p>Consulte os clientes e funcionários cadastrados no sistema.</p>
    </section>

    @if (msg(); as m) { <p class="mensagem" [class.erro]="m.erro">{{ m.texto }}</p> }

    <section class="painel">
      <h2>Funcionários cadastrados</h2>
      <div class="tabela-container">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Situação</th></tr></thead>
          <tbody>
            @for (f of funcionarios(); track f.idpessoa) {
              <tr>
                <td>{{ f.idpessoa }}</td>
                <td>{{ f.idpessoaNavigation?.nome || f.nome || 'Não informado' }}</td>
                <td>{{ f.cargo || 'Não informado' }}</td>
                <td>{{ f.idpessoaNavigation?.email || f.email || 'Não informado' }}</td>
                <td><span class="status" [class.inativo]="!ativo(f)">{{ ativo(f) ? 'Ativo' : 'Inativo' }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="vazio">Nenhum funcionário cadastrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="painel">
      <h2>Clientes cadastrados</h2>
      <form class="form" (ngSubmit)="buscarCliente()">
        <label>Consultar cliente pelo ID
          <input name="id" type="number" min="1" [(ngModel)]="idBusca" placeholder="Ex.: 4" />
        </label>
        <div class="acoes">
          <button class="botao" type="submit">Buscar</button>
          <button class="botao secundario" type="button" (click)="limparBusca()">Ver todos</button>
        </div>
      </form>

      <div class="tabela-container" style="margin-top: 20px">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Situação</th></tr></thead>
          <tbody>
            @for (c of clientes(); track c.idpessoa) {
              <tr>
                <td>{{ c.idpessoa }}</td>
                <td>{{ c.nome || 'Não informado' }}</td>
                <td>{{ c.cpf || 'Não informado' }}</td>
                <td>{{ c.email || 'Não informado' }}</td>
                <td>{{ c.telefone || 'Não informado' }}</td>
                <td><span class="status" [class.inativo]="!ativo(c)">{{ ativo(c) ? 'Ativo' : 'Inativo' }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="vazio">Nenhum cliente encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin.css'
})
export class AdminPessoas {
  private api = inject(AdminService);

  funcionarios = signal<any[]>([]);
  clientes = signal<any[]>([]);
  msg = signal<{ texto: string; erro: boolean } | null>(null);
  idBusca: number | null = null;

  constructor() {
    this.api.listar('Funcionarios').subscribe({
      next: dados => this.funcionarios.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os funcionários.'), true)
    });
    this.carregarClientes();
  }

  private aviso(texto: string, erro = false): void {
    this.msg.set({ texto, erro });
  }

  // No banco a situação é 'S' ou 'N'. Funciona para pessoa e para funcionário.
  ativo(x: any): boolean {
    const valor = x.idpessoaNavigation?.ativoPessoa ?? x.ativoPessoa;
    return valor !== 'N' && valor !== false;
  }

  carregarClientes(): void {
    this.api.listar('Clientes').subscribe({
      next: dados => this.clientes.set(dados),
      error: e => this.aviso(this.api.erro(e, 'Não foi possível carregar os clientes.'), true)
    });
  }

  buscarCliente(): void {
    if (!this.idBusca) {
      this.limparBusca();
      return;
    }

    this.api.buscar('Clientes', this.idBusca).subscribe({
      next: cliente => {
        this.clientes.set([cliente]);
        this.msg.set(null);
      },
      // 404: a API manda "Cliente não encontrado."
      error: e => {
        this.clientes.set([]);
        this.aviso(this.api.erro(e, 'Não foi possível consultar o cliente.'), true);
      }
    });
  }

  limparBusca(): void {
    this.idBusca = null;
    this.msg.set(null);
    this.carregarClientes();
  }
}