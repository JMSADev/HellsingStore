import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FuncionariosService } from '../../services/funcionarios.service';

@Component({
  selector: 'app-administracao',
  imports: [CommonModule, RouterLink],
  templateUrl: './administracao.html',
  styleUrl: './administracao.css'
})
export class Administracao {
  private funcionariosService = inject(FuncionariosService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  funcionarios: any[] = [];
  clientes: any[] = [];

  // Texto mostrado acima de cada tabela (vazio quando está tudo certo).
  msgFuncionarios = '';
  msgClientes = '';

  constructor() {
    this.carregarFuncionarios();
    this.carregarClientes();
  }

  carregarFuncionarios(): void {
    this.funcionarios = [];
    this.msgFuncionarios = '⏳ Carregando funcionários...';

    this.funcionariosService.listarFuncionarios().subscribe({
      next: dados => {
        this.funcionarios = dados;
        this.msgFuncionarios = dados.length ? '' : 'Nenhum funcionário cadastrado.';
        this.cdr.detectChanges(); // atualiza a tela
      },
      error: () => {
        this.msgFuncionarios = 'Não foi possível carregar os funcionários. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }

  carregarClientes(): void {
    this.clientes = [];
    this.msgClientes = '⏳ Carregando clientes...';

    this.http.get<any[]>('https://localhost:7139/api/Clientes').subscribe({
      next: dados => {
        this.clientes = dados;
        this.msgClientes = dados.length ? '' : 'Nenhum cliente cadastrado.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.msgClientes = 'Não foi possível carregar os clientes. Verifique se a API está funcionando.';
        this.cdr.detectChanges();
      }
    });
  }
}
