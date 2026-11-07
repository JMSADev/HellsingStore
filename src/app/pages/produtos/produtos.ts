import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutosService } from '../../services/produtos.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-produtos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos {
  private cdr = inject(ChangeDetectorRef);
  carrinho = inject(CarrinhoService);

  produtos: any[] = [];
  busca = '';
  categoria = '';
  tipo = ''; // '' = todos, 'P' = produtos, 'S' = serviços
  mensagem = '⏳ Carregando produtos e serviços...';

  constructor() {
    inject(ProdutosService).listarTudo().subscribe({
      next: dados => {
        this.produtos = dados;
        this.mensagem = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar o catálogo. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }

  // Categorias que existem no catálogo (para o filtro).
  get categorias(): string[] {
    return [...new Set(this.produtos.map(p => p.categoria).filter(c => c))];
  }

  // Itens que combinam com a busca, a categoria e o tipo escolhidos.
  get filtrados(): any[] {
    const termo = this.busca.toLowerCase().trim();
    return this.produtos.filter(p =>
      (!this.categoria || p.categoria === this.categoria) &&
      (!this.tipo || p.tipo === this.tipo) &&
      [p.nome, p.descricao, p.categoria].some(campo => (campo ?? '').toLowerCase().includes(termo))
    );
  }

  adicionar(produto: any): void {
    alert(this.carrinho.adicionar(produto)
      ? `${produto.nome} foi adicionado ao carrinho!`
      : 'Você atingiu a quantidade disponível em estoque!');
  }
}