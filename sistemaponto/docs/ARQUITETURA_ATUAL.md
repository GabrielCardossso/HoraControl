# Arquitetura atual do HoraControl

## Fluxo de uma requisição

```text
Navegador -> Spring Security -> Controller -> Service -> Repository -> PostgreSQL
```

As páginas usam `fetch` para acessar `/api/*`. O token CSRF fornecido pelo Spring é anexado às operações de alteração. O `localStorage` permanece apenas para a preferência visual de tema; registros de ponto e contas são persistidos no PostgreSQL.

## Domínio

- `Professor`: representa qualquer conta autenticada e contém um `Perfil`.
- `Curso`: agrupador acadêmico com código e situação.
- `Turma`: possui código operacional, curso, período, turno, carga prevista e datas.
- `RegistroPonto`: liga professor e turma, registrando entrada, saída, status, tipo e observações.
- `professor_turma`: define em quais turmas um professor pode registrar aulas.

## Segurança

O `CustomUserDetailsService` autentica por e-mail na tabela `professores`. A senha é BCrypt e nunca aparece no JSON. As rotas administrativas e os relatórios exigem `ROLE_ADMIN`.

## Relatórios

O mesmo filtro usado na prévia alimenta os arquivos:

- PDF: documento paisagem com total de horas e detalhamento dos registros.

O backend reaplica as permissões durante a exportação, impedindo que alguém amplie o próprio acesso apenas alterando parâmetros da URL.
