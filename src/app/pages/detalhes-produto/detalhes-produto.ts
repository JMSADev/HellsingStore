import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhes-produto.html',
  styleUrl: './detalhes-produto.css'
})
export class DetalhesProduto {
  private route = inject(ActivatedRoute);
  private produtosService = inject(ProdutosService);
  private carrinhoService = inject(CarrinhoService);
  private cdr = inject(ChangeDetectorRef);

  produto: any = null;
  carregando = true;
  mensagem = 'Carregando produto...';

  constructor() {
    this.carregarProduto();
  }

  carregarProduto(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.mensagem = 'Identificador de produto inválido.';
      this.carregando = false;
      return;
    }

    this.produtosService.listarProdutos().subscribe({
      next: (dados: any[]) => {
        this.produto = dados.find(
          item => Number(item.iditem) === id
        ) ?? null;

        this.mensagem = this.produto
          ? 'Produto encontrado.'
          : 'Produto não encontrado.';

        this.carregando = false;
        this.cdr.detectChanges();
      },

      error: (erro: any) => {
        console.error('Erro ao carregar produto:', erro);

        this.produto = null;
        this.mensagem =
          'Não foi possível carregar o produto. Verifique se a API está funcionando.';

        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obterPreco(): number {
    if (!this.produto) {
      return 0;
    }

    const preco = Number(
      this.produto.produto?.precoVenda ?? this.produto.preco ?? 0
    );

    return Number.isFinite(preco) && preco >= 0 ? preco : 0;
  }

  adicionarAoCarrinho(): void {
    if (!this.produto) {
      return;
    }

    this.carrinhoService.adicionar(this.produto);
    alert(`${this.produto.item1} foi adicionado ao carrinho!`);
  }
}