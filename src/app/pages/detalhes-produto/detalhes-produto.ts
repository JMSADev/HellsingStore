import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-detalhes-produto',
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhes-produto.html',
  styleUrl: './detalhes-produto.css'
})
export class DetalhesProduto {
  private cdr = inject(ChangeDetectorRef);
  private carrinho = inject(CarrinhoService);

  produto: any = null;
  mensagem = '⏳ Carregando produto...';

  constructor() {
    // O número que vem no endereço (/produtos/3) é o id do produto.
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

    inject(ProdutosService).listarProdutos().subscribe({
      next: dados => {
        this.produto = dados.find(p => Number(p.iditem) === id);
        this.mensagem = 'Produto não encontrado.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar o produto. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }

  adicionar(): void {
    alert(this.carrinho.adicionar(this.produto)
      ? `${this.produto.nome} foi adicionado ao carrinho!`
      : 'Você atingiu a quantidade disponível em estoque!');
  }
}
