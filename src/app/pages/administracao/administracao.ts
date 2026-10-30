import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FuncionariosService } from '../../services/funcionarios.service';

@Component({
  selector: 'app-administracao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './administracao.html',
  styleUrl: './administracao.css'
})
export class Administracao {
  private funcionariosService = inject(FuncionariosService);
  private cdr = inject(ChangeDetectorRef);

  funcionarios: any[] = [];
  carregando = true;
  mensagem = 'Carregando funcionários...';

  constructor() {
    this.carregarFuncionarios();
  }

  carregarFuncionarios(): void {
    this.carregando = true;
    this.mensagem = 'Carregando funcionários...';

    this.funcionariosService.listarFuncionarios().subscribe({
      next: (dados: any[]) => {
        console.log('Funcionários recebidos:', dados);

        this.funcionarios = dados;
        this.mensagem = dados.length > 0
          ? 'Funcionários carregados com sucesso!'
          : 'Nenhum funcionário cadastrado.';

        this.carregando = false;
        this.cdr.detectChanges();
      },

      error: (erro: any) => {
        console.error('Erro ao carregar funcionários:', erro);

        this.funcionarios = [];
        this.mensagem =
          'Não foi possível carregar os funcionários. Verifique se a API está funcionando.';

        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }
}