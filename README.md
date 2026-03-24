# IAPE Trainee - sistema base (v2)

## Ajustes desta versão

- cabeçalho do cadastro reduzido para caber melhor na impressão
- foto do perfil sem sobreposição no topo
- `Curso` com seleção fixa: `ADM 01`, `ADM 02`, `WEB 01`, `WEB 02`
- `Turma` preenchida automaticamente: `01 -> 1` e `02 -> 2`
- `Gênero` com seleção: `Masculino`, `Feminino`
- `Tipo de Bolsa` com seleção fixa
- campo de idade mantido e recalculado automaticamente a partir da data
- aviso explícito para não abrir o sistema em `file://`
- arquivo único `assets/config.js` continua controlando a URL da API

## O que está incluído

- `Code.gs` para Google Apps Script
- `assets/config.js` com URL única da API
- `assets/api.js`, `assets/ui.js` e `assets/app.css`
- `login.html`
- `index.html`
- `students.html`
- `student.html`
- `reports.html`
- `absences.html`
- `ranking.html`
- `run_local_server.sh`

## Arquivo único de configuração da URL

Edite apenas este arquivo:

- `assets/config.js`

Campo principal:

- `API_URL: 'COLE_AQUI_A_URL_DO_WEB_APP'`

Ao trocar essa URL, todas as páginas passam a usar a nova automaticamente.

## Como subir o backend

1. Abra a planilha principal do novo sistema.
2. Vá em `Extensões > Apps Script`.
3. Cole o conteúdo de `Code.gs`.
4. Execute `setupIapeTraineeSystem()`.
5. Depois execute `seedFirstEditor('seu_login','sua_senha')`.
6. Em `SETTINGS`, preencha:
   - `ATTENDANCE_SPREADSHEET_ID` com o ID da planilha de presença.
   - `LOGO_URL` com a URL pública da logo PNG, se quiser usar a logo no relatório.
   - `PASSWORD_SALT` trocando o valor padrão.
7. Implante como `Aplicativo da Web`.

## Como abrir o front-end corretamente

Não abra os HTMLs diretamente com `file://`.

Use uma destas opções:

### Opção 1: servidor local

No Linux, dentro da pasta do sistema:

```bash
chmod +x run_local_server.sh
./run_local_server.sh
```

Depois abra:

```text
http://localhost:8000/login.html
```

### Opção 2: Python puro

```bash
python3 -m http.server 8000
```

### Opção 3: GitHub Pages

Envie os arquivos HTML e a pasta `assets` para o GitHub Pages.

## Lógica das notas

- `Frequência`: vem da planilha externa de presença.
- `Pontualidade`, `Engajamento` e `Rendimento`: são lançamentos manuais por percentual.
- O valor mostrado no relatório é a média dos lançamentos daquela competência.

Exemplo:
- 100 e 40 em Pontualidade
- média final = 70
- barra exibida = 70%

## Estrutura das abas criadas

### STUDENTS
Cadastro principal do aluno.

### SCORE_ENTRIES
Histórico de lançamentos manuais das 3 competências.

### USERS
Usuários do sistema.

### SESSIONS
Sessões ativas de login.

### SETTINGS
Configurações simples do sistema.

## Observação importante sobre frequência

O código lê a aba `Attendance` da planilha externa. Ele considera a porcentagem em cima da quantidade real de registros encontrados para o aluno no período consultado.
