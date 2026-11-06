import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Todos os campos do formulário (pessoa + endereço) começam vazios.
const formularioVazio = () => ({
  nome: '', cpf: '', dataNascimento: '', sexo: '', email: '', telefone: '',
  cep: '', numero: '', complemento: ''
});

const soNumeros = (texto: string) => texto.replace(/\D/g, '');

@Component({
  selector: 'app-clientes',
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'https://localhost:7139/api/Clientes';

  dados = formularioVazio();
  mensagem = '';
  cadastrando = false;

  // Coloca a máscara no texto: cada "0" do modelo é um dígito.
  // Ex.: mascara('12345678900', '000.000.000-00') => '123.456.789-00'
  private mascara(texto: string, modelo: string): string {
    const numeros = soNumeros(texto);
    let resultado = '';
    let i = 0;

    for (const caractere of modelo) {
      if (i >= numeros.length) break; // acabaram os dígitos
      resultado += caractere === '0' ? numeros[i++] : caractere;
    }
    return resultado;
  }

  formatarCPF(): void {
    this.dados.cpf = this.mascara(this.dados.cpf, '000.000.000-00');
  }

  formatarCEP(): void {
    this.dados.cep = this.mascara(this.dados.cep, '00000-000');
  }

  formatarTelefone(): void {
    const celular = soNumeros(this.dados.telefone).length > 10; // celular tem 11 dígitos
    this.dados.telefone = this.mascara(this.dados.telefone, celular ? '(00) 00000-0000' : '(00) 0000-0000');
  }

  limpar(): void {
    this.dados = formularioVazio();
    this.mensagem = '';
  }

  async cadastrar(): Promise<void> {
    const { cep, numero, complemento, ...cliente } = this.dados; // separa o endereço da pessoa
    const cpfNumeros = soNumeros(cliente.cpf);
    const telefoneNumeros = soNumeros(cliente.telefone);
    const cepNumeros = soNumeros(cep);

    if (!cliente.nome.trim() || !cliente.dataNascimento || !cliente.sexo) {
      this.mensagem = 'Preencha o nome, a data de nascimento e o sexo.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cliente.email)) { this.mensagem = 'Digite um e-mail válido.'; return; }
    if (cpfNumeros.length !== 11) { this.mensagem = 'Digite um CPF válido com 11 números.'; return; }
    if (telefoneNumeros.length < 10) { this.mensagem = 'Digite um telefone válido.'; return; }
    if (cepNumeros.length !== 8) { this.mensagem = 'Digite um CEP válido com 8 números.'; return; }
    if (!numero.trim()) { this.mensagem = 'Informe o número do endereço.'; return; }

    this.cadastrando = true;
    this.mensagem = '';

    // 1º cadastra a pessoa. A API envia CPF e telefone como número, sem máscara.
    let pessoaCriada: any;
    try {
      pessoaCriada = await firstValueFrom(this.http.post<any>(this.apiUrl, {
        ...cliente,
        cpf: Number(cpfNumeros),
        telefone: Number(telefoneNumeros),
        ativoPessoa: 'S'
      }));
    } catch (erro: any) {
      // Mostra a mensagem enviada pela API (ex.: "Já existe uma pessoa com este CPF.").
      this.mensagem = erro.error?.mensagem ?? 'Não foi possível cadastrar o cliente.';
      this.cadastrando = false;
      this.cdr.detectChanges();
      return;
    }

    // 2º cadastra o endereço dessa pessoa.
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/${pessoaCriada.idpessoa}/Endereco`, {
        cep: cepNumeros, numero, complemento
      }));
      this.mensagem = 'Cliente cadastrado com sucesso!';
      this.dados = formularioVazio();
    } catch {
      this.mensagem = 'Cliente cadastrado, mas ocorreu um erro ao cadastrar o endereço.';
    }

    this.cadastrando = false;
    this.cdr.detectChanges(); // atualiza a tela depois da espera
  }
}
