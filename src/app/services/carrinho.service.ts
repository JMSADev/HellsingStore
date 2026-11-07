import { Injectable } from '@angular/core';

export interface ItemCarrinho {
  produto: any;
  quantidade: number;
}

// Guarda o carrinho. Por ser "root", é o mesmo carrinho em todas as páginas.
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  itens: ItemCarrinho[] = [];

  preco(produto: any): number {
    return Number(produto.precoVenda ?? produto.preco ?? 0);
  }

  get quantidade(): number {
    return this.itens.reduce((soma, item) => soma + item.quantidade, 0);
  }

  get total(): number {
    return this.itens.reduce((soma, item) => soma + this.preco(item.produto) * item.quantidade, 0);
  }

  // Adiciona 1 unidade. Devolve false se não houver mais estoque.
  adicionar(produto: any): boolean {
    const item = this.itens.find(i => i.produto.iditem === produto.iditem);

    if (produto.tipo !== 'S' && (item?.quantidade ?? 0) >= (produto.quantidadeEstoque ?? 0)) return false;

    if (item) item.quantidade++;
    else this.itens.push({ produto, quantidade: 1 });
    return true;
  }

  diminuir(item: ItemCarrinho): void {
    item.quantidade--;
    if (item.quantidade === 0) this.remover(item);
  }

  remover(item: ItemCarrinho): void {
    this.itens = this.itens.filter(i => i !== item);
  }

  limpar(): void {
    this.itens = [];
  }
}
