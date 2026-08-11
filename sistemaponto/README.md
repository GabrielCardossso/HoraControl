# HoraControl

Sistema web de controle de ponto de professores horistas, com autenticação por banco de dados, níveis de acesso, turmas identificadas por código, cálculo financeiro e relatórios PDF/Excel.

## Tecnologias

- Java 17 e Spring Boot 3.5
- Spring MVC, Security e Data JPA
- Thymeleaf, HTML, CSS e JavaScript
- PostgreSQL e Flyway
- Apache POI para Excel
- OpenPDF para PDF
- H2 isolado para testes

## Execução local

1. Crie no PostgreSQL o banco `sistemaPonto`.
2. Copie `.env.example.properties` para `.env.properties`.
3. Preencha a senha local do PostgreSQL e uma senha administrativa inicial.
4. Execute:

```powershell
.\mvnw.cmd spring-boot:run
```

5. Acesse `http://localhost:8080`.

O `.env.properties` é ignorado pelo Git. Em hospedagem, configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` como variáveis de ambiente.

## Perfis e permissões

| Perfil | Pontos visíveis | Relatórios | Administração |
|---|---|---|---|
| Professor | Somente os próprios | Somente os próprios | Não |
| Coordenador de curso | Registros do curso vinculado | Curso vinculado | Não |
| Coordenador de núcleo | Todos | Todos | Não |
| Coordenador de eixo | Todos | Todos | Não |
| Administrador | Todos | Todos | Usuários, cursos e turmas |

Somente o administrador cria e gerencia contas. Não existe cadastro público.

## Regras principais

- Cada professor pode possuir somente um ponto aberto.
- A entrada e a saída usam o horário do servidor.
- Aula normal exige uma turma ativa.
- Professor com turmas vinculadas só registra aula nessas turmas.
- Fechamento altera o registro para `FECHADO`.
- O total é calculado por minutos trabalhados multiplicados pelo valor-hora da turma.
- Registros abertos não geram valor financeiro.
- Código de turma, e-mail, matrícula e CPF possuem regras de unicidade quando informados.
- Exclusão de usuário ou turma é lógica: o cadastro é inativado para preservar histórico.

## Banco e migrations

O Flyway executa scripts em `src/main/resources/db/migration`. O Hibernate utiliza `validate`, portanto não apaga nem recria tabelas ao iniciar. Para um PostgreSQL online, crie o banco vazio, configure as variáveis de conexão e inicie a aplicação; o Flyway monta a estrutura.

## Testes

```powershell
.\mvnw.cmd clean test
```

Os testes usam H2 em memória e nunca acessam o PostgreSQL local. Há verificações de contexto, permissões, regras de ponto e validade dos arquivos PDF/Excel.

## Estrutura

- `config`: segurança, autenticação e carga do administrador inicial.
- `controller`: páginas e endpoints HTTP.
- `dto`: contratos de entrada de dados.
- `entity`: modelo persistido.
- `enums`: perfis, status e tipos de registro.
- `exception`: erros padronizados da API.
- `repository`: acesso JPA ao banco.
- `service`: regras de negócio e geração de relatórios.
- `templates`: páginas Thymeleaf.
- `static`: CSS, JavaScript e imagens.
- `db/migration`: evolução versionada do PostgreSQL.
