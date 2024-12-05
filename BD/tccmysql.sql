create database LingoKids;
use LingoKids;
create table tema (
cod integer not null auto_increment,
descricao varchar(15),
primary key (cod));
create table objetivo (
cod integer not null auto_increment,
descricao varchar(20),
primary key (cod));
create table dificuldade (
cod integer not null auto_increment,
descricao varchar(15),
primary key (cod));
create table nivel (
cod integer not null auto_increment,
descricao varchar(2),
primary key (cod));
create table usuario (
cod integer not null auto_increment,
nome varchar(50),
login varchar(30),
senha varchar(20),
perfil varchar(50),
data_nasc date,
fone varchar(11),
email varchar(50),
primary key (cod));
create table interage (
cod integer not null auto_increment,
data date,
hora time,
fase varchar(50),
pontuacao integer,
cod_usuario integer not null,
cod_atividade integer not null,
primary key (cod),
foreign key (cod_usuario) references usuario(cod),
foreign key (cod_atividade) references atividade(cod));
create table atividade (
cod integer not null auto_increment,
descricao varchar(100),
imagem blob,
nome varchar(50),
fases integer,
como_jogar varchar(100),
tempo time,
pre_requisito varchar(50),
cod_tema integer not null,
cod_objetivo integer not null,
cod_dificuldade integer not null,
cod_nivel integer not null,
primary key (cod),
foreign key (cod_tema) references tema(cod),
foreign key (cod_objetivo) references objetivo(cod),
foreign key (cod_dificuldade) references dificuldade(cod),
foreign key (cod_nivel) references nivel(cod));