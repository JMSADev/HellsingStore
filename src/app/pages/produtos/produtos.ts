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
  mensagem = '⏳ Carregando produtos...'; // fica vazia quando os produtos chegam

  constructor() {
    inject(ProdutosService).listarProdutos().subscribe({
      next: dados => {
        this.produtos = dados;
        this.mensagem = '';
        this.cdr.detectChanges(); // atualiza a tela
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar os produtos. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }

  // Produtos que combinam com o texto digitado na busca.
  get filtrados(): any[] {
    const termo = this.busca.toLowerCase().trim();
    return this.produtos.filter(p =>
      [p.nome, p.descricao, p.categoria].some(campo => (campo ?? '').toLowerCase().includes(termo))
    );
  }

  adicionar(produto: any): void {
    alert(this.carrinho.adicionar(produto)
      ? `${produto.nome} foi adicionado ao carrinho!`
      : 'Você atingiu a quantidade disponível em estoque!');
  }
}
