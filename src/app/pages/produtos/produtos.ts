import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos {
  private produtosService = inject(ProdutosService);
  private cdr = inject(ChangeDetectorRef);
  private carrinhoService = inject(CarrinhoService);

  produtos: any[] = [];
  carregando = true;
  mensagem = 'Carregando produtos...';

  constructor() {
    this.carregarProdutos();
  }

  adicionarAoCarrinho(produto: any): void {
    this.carrinhoService.adicionar(produto);
    alert(`${produto.item1} foi adicionado ao carrinho!`);
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.mensagem = 'Carregando produtos...';

    this.produtosService.listarProdutos().subscribe({
      next: (dados: any[]) => {
        console.log('Produtos recebidos:', dados);

        this.produtos = dados;
        this.mensagem = dados.length > 0
          ? 'Produtos carregados com sucesso!'
          : 'Nenhum produto encontrado.';

        this.carregando = false;
        this.cdr.detectChanges();
      },

      error: (erro: any) => {
        console.error('Erro ao carregar produtos:', erro);

        this.produtos = [];
        this.mensagem =
          'Não foi possível carregar os produtos. Verifique se a API está funcionando.';

        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obterPreco(produto: any): number {
    const preco = Number(
      produto.produto?.precoVenda ?? produto.preco ?? 0
    );

    return Number.isFinite(preco) && preco >= 0 ? preco : 0;
  }
}