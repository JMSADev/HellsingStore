import {
  Component,
  signal,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FuncionariosService } from './services/funcionarios.service';
import { ProdutosService } from './services/produtos.service';

interface ItemCarrinho {
  produto: any;
  quantidade: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('HellsingStore');

  private funcionariosService = inject(FuncionariosService);
  private produtosService = inject(ProdutosService);
  private cdr = inject(ChangeDetectorRef);

  funcionarios: any[] = [];
  carregandoFuncionarios = true;
  mensagem = 'Carregando funcionários...';

  produtos: any[] = [];
  carregandoProdutos = true;
  mensagemProdutos = 'Carregando produtos...';

  carrinho: ItemCarrinho[] = [];
  mensagemCarrinho = '';

  constructor() {
    this.carregarFuncionarios();
    this.carregarProdutos();
  }

  carregarFuncionarios(): void {
    this.carregandoFuncionarios = true;
    this.mensagem = 'Carregando funcionários...';

    this.funcionariosService.listarFuncionarios().subscribe({
      next: (dados: any[]) => {
        console.log('Funcionários recebidos:', dados);

        this.funcionarios = dados;
        this.mensagem = dados.length > 0
          ? 'Funcionários carregados com sucesso!'
          : 'Nenhum funcionário encontrado.';

        this.carregandoFuncionarios = false;
        this.cdr.detectChanges();
      },

      error: (erro: any) => {
        console.error('Erro ao consultar funcionários:', erro);

        this.funcionarios = [];
        this.mensagem =
          'Erro ao carregar funcionários. Verifique se a API está iniciada.';

        this.carregandoFuncionarios = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarProdutos(): void {
    this.carregandoProdutos = true;
    this.mensagemProdutos = 'Carregando produtos...';

    this.produtosService.listarProdutos().subscribe({
      next: (dados: any[]) => {
        console.log('Produtos recebidos:', dados);

        this.produtos = dados;
        this.mensagemProdutos = dados.length > 0
          ? 'Produtos carregados com sucesso!'
          : 'Nenhum produto encontrado.';

        this.carregandoProdutos = false;
        this.cdr.detectChanges();
      },

      error: (erro: any) => {
        console.error('Erro ao consultar produtos:', erro);

        this.produtos = [];
        this.mensagemProdutos =
          'Erro ao carregar produtos. Verifique se a API está iniciada.';

        this.carregandoProdutos = false;
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

  obterQuantidadeCarrinho(): number {
    return this.carrinho.reduce(
      (total, item) => total + item.quantidade,
      0
    );
  }

  obterTotalCarrinho(): number {
    return this.carrinho.reduce(
      (total, item) =>
        total + this.obterPreco(item.produto) * item.quantidade,
      0
    );
  }

  adicionarAoCarrinho(produto: any): void {
    const idProduto = produto.iditem;

    const itemExistente = this.carrinho.find(
      item => item.produto.iditem === idProduto
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.carrinho.push({
        produto,
        quantidade: 1
      });
    }

    this.mensagemCarrinho = `${produto.item1} foi adicionado ao carrinho!`;

    this.cdr.detectChanges();

    console.log('Carrinho atualizado:', this.carrinho);
  }

  aumentarQuantidade(item: ItemCarrinho): void {
    item.quantidade++;
    this.cdr.detectChanges();
  }

  diminuirQuantidade(item: ItemCarrinho): void {
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      this.removerDoCarrinho(item);
      return;
    }

    this.cdr.detectChanges();
  }

  removerDoCarrinho(itemRemover: ItemCarrinho): void {
    this.carrinho = this.carrinho.filter(
      item => item !== itemRemover
    );

    this.cdr.detectChanges();
  }

  limparCarrinho(): void {
    this.carrinho = [];
    this.mensagemCarrinho = 'Carrinho esvaziado.';
    this.cdr.detectChanges();
  }

  irParaCarrinho(): void {
    document.getElementById('carrinho')?.scrollIntoView({
      behavior: 'smooth'
    });
  }
}