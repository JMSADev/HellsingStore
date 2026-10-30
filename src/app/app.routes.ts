import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio)
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./pages/produtos/produtos').then(m => m.Produtos)
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./pages/carrinho/carrinho').then(m => m.Carrinho)
  },
  {
    path: 'administracao',
    loadComponent: () =>
      import('./pages/administracao/administracao')
        .then(m => m.Administracao)
  },
  {
    path: 'produtos/:id',
    loadComponent: () =>
      import('./pages/detalhes-produto/detalhes-produto')
        .then(m => m.DetalhesProduto)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
  
];