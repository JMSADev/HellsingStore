import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Produtos } from './pages/produtos/produtos';
import { DetalhesProduto } from './pages/detalhes-produto/detalhes-produto';
import { Carrinho } from './pages/carrinho/carrinho';
import { Clientes } from './pages/clientes/clientes';

// Cada endereço do site mostra uma página.
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'produtos', component: Produtos },
  { path: 'produtos/:id', component: DetalhesProduto },
  { path: 'carrinho', component: Carrinho },
  { path: 'clientes', component: Clientes },
  { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos) },

  // Painel administrativo: o menu (AdminLayout) fica fixo e cada tela entra dentro dele.
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/admin/admin-resumo').then(m => m.AdminResumo) },
      { path: 'pedidos', loadComponent: () => import('./pages/admin/admin-pedidos').then(m => m.AdminPedidos) },
      { path: 'produtos', loadComponent: () => import('./pages/admin/admin-produtos').then(m => m.AdminProdutos) },
      { path: 'servicos', loadComponent: () => import('./pages/admin/admin-servicos').then(m => m.AdminServicos) },
      { path: 'categorias', loadComponent: () => import('./pages/admin/admin-categorias').then(m => m.AdminCategorias) },
      { path: 'entradas', loadComponent: () => import('./pages/admin/admin-entradas').then(m => m.AdminEntradas) },
      { path: 'estoque', loadComponent: () => import('./pages/admin/admin-estoque').then(m => m.AdminEstoque) },
      { path: 'pessoas', loadComponent: () => import('./pages/admin/admin-pessoas').then(m => m.AdminPessoas) }
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];