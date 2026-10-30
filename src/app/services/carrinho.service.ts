import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemCarrinho {
  produto: any;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private itens: ItemCarrinho[] = [];

  private carrinhoSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  public carrinho$ = this.carrinhoSubject.asObservable();

  obterItens(): ItemCarrinho[] {
    return [...this.itens];
  }

  obterQuantidade(): number {
    return this.itens.reduce(
      (total, item) => total + item.quantidade,
      0
    );
  }

  obterPreco(produto: any): number {
    const preco = Number(
      produto.produto?.precoVenda ?? produto.preco ?? 0
    );

    return Number.isFinite(preco) && preco >= 0 ? preco : 0;
  }

  obterTotal(): number {
    return this.itens.reduce(
      (total, item) =>
        total + this.obterPreco(item.produto) * item.quantidade,
      0
    );
  }

  adicionar(produto: any): void {
    const itemExistente = this.itens.find(
      item => item.produto.iditem === produto.iditem
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.itens.push({
        produto,
        quantidade: 1
      });
    }

    this.atualizarCarrinho();
  }

  aumentar(item: ItemCarrinho): void {
    const itemExistente = this.itens.find(
      atual => atual.produto.iditem === item.produto.iditem
    );

    if (itemExistente) {
      itemExistente.quantidade++;
      this.atualizarCarrinho();
    }
  }

  diminuir(item: ItemCarrinho): void {
    const itemExistente = this.itens.find(
      atual => atual.produto.iditem === item.produto.iditem
    );

    if (!itemExistente) {
      return;
    }

    if (itemExistente.quantidade > 1) {
      itemExistente.quantidade--;
      this.atualizarCarrinho();
    } else {
      this.remover(itemExistente);
    }
  }

  remover(item: ItemCarrinho): void {
    this.itens = this.itens.filter(
      atual => atual.produto.iditem !== item.produto.iditem
    );

    this.atualizarCarrinho();
  }

  limpar(): void {
    this.itens = [];
    this.atualizarCarrinho();
  }

  private atualizarCarrinho(): void {
    this.carrinhoSubject.next([...this.itens]);
  }
}