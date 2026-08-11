CREATE TABLE IF NOT EXISTS curso (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE curso ADD COLUMN IF NOT EXISTS codigo VARCHAR(50);
ALTER TABLE curso ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS uk_curso_codigo ON curso (codigo) WHERE codigo IS NOT NULL;

CREATE TABLE IF NOT EXISTS professores (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(50),
    cpf VARCHAR(14),
    email VARCHAR(180) NOT NULL,
    telefone VARCHAR(30),
    perfil VARCHAR(40) NOT NULL DEFAULT 'PROFESSOR',
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    curso_responsavel_id BIGINT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE professores ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE professores ADD COLUMN IF NOT EXISTS telefone VARCHAR(30);
ALTER TABLE professores ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS curso_responsavel_id BIGINT;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE professores SET perfil = 'ADMIN' WHERE email = 'admin@sistemaponto.com' AND perfil IS NULL;
UPDATE professores SET ativo = TRUE WHERE ativo IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_professor_email ON professores (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS uk_professor_matricula ON professores (matricula) WHERE matricula IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_professor_cpf ON professores (cpf) WHERE cpf IS NOT NULL;

CREATE TABLE IF NOT EXISTS turma (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(60),
    nome VARCHAR(160) NOT NULL,
    periodo VARCHAR(80),
    turno VARCHAR(40),
    valor_hora NUMERIC(12,2) NOT NULL DEFAULT 0,
    carga_horaria_prevista NUMERIC(10,2),
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    curso_id BIGINT
);

ALTER TABLE turma ADD COLUMN IF NOT EXISTS codigo VARCHAR(60);
ALTER TABLE turma ADD COLUMN IF NOT EXISTS carga_horaria_prevista NUMERIC(10,2);
ALTER TABLE turma ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE turma ADD COLUMN IF NOT EXISTS data_fim DATE;
ALTER TABLE turma ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE turma SET valor_hora = 0 WHERE valor_hora IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_turma_codigo ON turma (LOWER(codigo)) WHERE codigo IS NOT NULL;

CREATE TABLE IF NOT EXISTS professor_turma (
    professor_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    PRIMARY KEY (professor_id, turma_id)
);

CREATE TABLE IF NOT EXISTS registro_ponto (
    id BIGSERIAL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    turma_id BIGINT,
    tipo VARCHAR(30) NOT NULL DEFAULT 'AULA_NORMAL',
    descricao VARCHAR(180),
    entrada TIMESTAMP NOT NULL,
    saida TIMESTAMP,
    observacao VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTO',
    ajustado BOOLEAN NOT NULL DEFAULT FALSE,
    justificativa_ajuste VARCHAR(500),
    alterado_por_id BIGINT,
    data_alteracao TIMESTAMP
);

ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'AULA_NORMAL';
ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS descricao VARCHAR(180);
ALTER TABLE registro_ponto ALTER COLUMN observacao TYPE VARCHAR(1000);
ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS ajustado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS justificativa_ajuste VARCHAR(500);
ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS alterado_por_id BIGINT;
ALTER TABLE registro_ponto ADD COLUMN IF NOT EXISTS data_alteracao TIMESTAMP;

DO $$ BEGIN
    ALTER TABLE professores ADD CONSTRAINT fk_professor_curso FOREIGN KEY (curso_responsavel_id) REFERENCES curso(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE turma ADD CONSTRAINT fk_turma_curso FOREIGN KEY (curso_id) REFERENCES curso(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE professor_turma ADD CONSTRAINT fk_professor_turma_professor FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE professor_turma ADD CONSTRAINT fk_professor_turma_turma FOREIGN KEY (turma_id) REFERENCES turma(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE registro_ponto ADD CONSTRAINT fk_registro_professor FOREIGN KEY (professor_id) REFERENCES professores(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE registro_ponto ADD CONSTRAINT fk_registro_turma FOREIGN KEY (turma_id) REFERENCES turma(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE registro_ponto ADD CONSTRAINT fk_registro_alterado_por FOREIGN KEY (alterado_por_id) REFERENCES professores(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_registro_professor_entrada ON registro_ponto (professor_id, entrada DESC);
CREATE INDEX IF NOT EXISTS idx_registro_turma_entrada ON registro_ponto (turma_id, entrada DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uk_registro_ponto_aberto_professor
    ON registro_ponto (professor_id) WHERE status = 'ABERTO';
