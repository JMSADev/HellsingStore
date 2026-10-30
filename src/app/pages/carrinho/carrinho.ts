import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CarrinhoService,
  ItemCarrinho
} from '../../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  private carrinhoService = inject(CarrinhoService);
  private cdr = inject(ChangeDetectorRef);

  itens: ItemCarrinho[] = [];
  mensagem = '';

  constructor() {
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.itens = itens;
      this.cdr.detectChanges();
    });
  }

  obterPreco(produto: any): number {
    return this.carrinhoService.obterPreco(produto);
  }

  obterQuantidade(): number {
    return this.carrinhoService.obterQuantidade();
  }

  obterTotal(): number {
    return this.carrinhoService.obterTotal();
  }

  aumentar(item: ItemCarrinho): void {
    this.carrinhoService.aumentar(item);
  }

  diminuir(item: ItemCarrinho): void {
    this.carrinhoService.diminuir(item);
  }

  remover(item: ItemCarrinho): void {
    this.carrinhoService.remover(item);
  }

  limpar(): void {
    this.carrinhoService.limpar();
    this.mensagem = 'Carrinho esvaziado.';
    this.cdr.detectChanges();
  }
}