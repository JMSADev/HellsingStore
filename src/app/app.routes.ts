import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Produtos } from './pages/produtos/produtos';
import { DetalhesProduto } from './pages/detalhes-produto/detalhes-produto';
import { Carrinho } from './pages/carrinho/carrinho';
import { Clientes } from './pages/clientes/clientes';
import { Administracao } from './pages/administracao/administracao';

// Cada endereço do site mostra uma página.
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'produtos', component: Produtos },
  { path: 'produtos/:id', component: DetalhesProduto },
  { path: 'carrinho', component: Carrinho },
  { path: 'clientes', component: Clientes },
  {path: 'pedidos', loadComponent: () =>import('./pages/pedidos/pedidos').then(m => m.Pedidos)},
  { path: 'administracao', component: Administracao },
  { path: '**', redirectTo: 'inicio' }
];
