-- Cria banco

CREATE DATABASE IF NOT EXISTS contabilidade;

USE contabilidade;

-- ==========================
-- TABELA DE USUÁRIOS
-- ==========================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('ADMIN','USUARIO') NOT NULL DEFAULT 'USUARIO'
);

-- Usuário inicial
-- Defina a senha diretamente na aplicação ou em variável de ambiente.

-- ==========================
-- TABELA DE EMPRESAS
-- ==========================

CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(255),
    cod_completo VARCHAR(50) NOT NULL,
    cod VARCHAR(20),
    filial VARCHAR(50),
    municipio VARCHAR(100),
    cnpj VARCHAR(18),
    ccm VARCHAR(30),
    regime_tributario VARCHAR(50),
    dia_previa_1 INT NOT NULL,
    dia_previa_2 INT NOT NULL,
    nota_do_milhao BOOLEAN,
    nfse BOOLEAN,
    nfts BOOLEAN,
    guia_iss BOOLEAN,
    encerra_dctfweb BOOLEAN,
    data_guia_iss INT NOT NULL,
    CONSTRAINT unique_cod_completo UNIQUE (cod_completo)
);

-- ==========================
-- TABELA DE PESSOAS FÍSICAS
-- ==========================

CREATE TABLE IF NOT EXISTS fisica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    cod_completo VARCHAR(50) NOT NULL,
    cod VARCHAR(20),
    municipio VARCHAR(100),
    cpf VARCHAR(11)
);

-- ==========================
-- CONSULTAS DE TESTE
-- ==========================

SELECT usuario, senha FROM usuarios;

SELECT * FROM empresas;

SELECT * FROM fisica;