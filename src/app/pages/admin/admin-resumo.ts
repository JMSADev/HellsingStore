import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-resumo',
  template: `
    <section class="titulo">
      <h1>Resumo</h1>
      <p>Visão geral do sistema, com dados da API.</p>
    </section>

    @if (erro()) { <p class="mensagem erro">{{ erro() }}</p> }

    @if (dados(); as d) {
      <div class="cards">
        <div class="card"><span>Clientes ativos</span><strong>{{ d.clientes }}</strong></div>
        <div class="card"><span>Produtos ativos</span><strong>{{ d.produtos }}</strong></div>
        <div class="card"><span>Serviços ativos</span><strong>{{ d.servicos }}</strong></div>
        <div class="card"><span>Pedidos</span><strong>{{ d.pedidos }}</strong></div>
        <div class="card"><span>Pedidos em aberto</span><strong>{{ d.pedidosEmAberto }}</strong></div>
        <div class="card"><span>Unidades em estoque</span><strong>{{ d.unidadesEmEstoque }}</strong></div>
      </div>
    } @else if (!erro()) {
      <p class="vazio">⏳ Carregando...</p>
    }
  `,
  styleUrl: './admin.css'
})
export class AdminResumo {
  dados = signal<any>(null);
  erro = signal('');

  constructor() {
    const api = inject(AdminService);
    api.resumo().subscribe({
      next: d => this.dados.set(d),
      error: e => this.erro.set(api.erro(e, 'Não foi possível carregar o resumo.'))
    });
  }
}