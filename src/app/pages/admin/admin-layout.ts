import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="cabecalho">
      <a routerLink="/inicio" class="logo">Hellsing<span class="vermelho">Store</span> · Admin</a>
      <nav>
        <a routerLink="/admin" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: true }">Resumo</a>
        <a routerLink="/admin/pedidos" routerLinkActive="ativo">Pedidos</a>
        <a routerLink="/admin/produtos" routerLinkActive="ativo">Produtos</a>
        <a routerLink="/admin/servicos" routerLinkActive="ativo">Serviços</a>
        <a routerLink="/admin/categorias" routerLinkActive="ativo">Categorias</a>
        <a routerLink="/admin/entradas" routerLinkActive="ativo">Entrada de produtos</a>
        <a routerLink="/admin/estoque" routerLinkActive="ativo">Estoque</a>
        <a routerLink="/admin/pessoas" routerLinkActive="ativo">Clientes e funcionários</a>
        <a routerLink="/inicio">Ver loja</a>
      </nav>
    </header>
    <main class="conteudo">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0b0b0d; color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; }
    .cabecalho { padding: 20px 5%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid #252529; background: #101012; }
    .logo { color: #f5f5f5; text-decoration: none; font-size: 22px; font-weight: 800; }
    .vermelho { color: #e63946; }
    nav { display: flex; flex-wrap: wrap; gap: 20px; }
    nav a { color: #c7c7cb; text-decoration: none; font-size: 14px; }
    nav a:hover, nav a.ativo { color: #e63946; }
    .conteudo { width: min(1200px, 92%); margin: 0 auto; padding: 40px 0 80px; }
  `]
})
export class AdminLayout {}