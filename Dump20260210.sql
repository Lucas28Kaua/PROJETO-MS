-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mydb
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'c17a5fe9-ca4a-11f0-88d6-8cb0e9d6c3b9:1-416';

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `num_beneficio` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  `senha_inss` varchar(255) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `cidade` varchar(50) NOT NULL,
  `bairro` varchar(45) NOT NULL,
  `rua` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`),
  UNIQUE KEY `num-beneficio_UNIQUE` (`num_beneficio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes_mensais`
--

DROP TABLE IF EXISTS `configuracoes_mensais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_mensais` (
  `id` int NOT NULL DEFAULT '1',
  `meta_geral` decimal(15,2) DEFAULT '0.00',
  `meta_individual` decimal(15,2) DEFAULT '0.00',
  `regras_json` text,
  `ultima_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes_mensais`
--

LOCK TABLES `configuracoes_mensais` WRITE;
/*!40000 ALTER TABLE `configuracoes_mensais` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracoes_mensais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_cliente`
--

DROP TABLE IF EXISTS `documentos_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_cliente` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `tipo_documento` varchar(255) DEFAULT NULL,
  `url_documento` varchar(255) NOT NULL,
  `data_upload` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  UNIQUE KEY `uk_cliente_tipo` (`cliente_id`,`tipo_documento`),
  UNIQUE KEY `cliente_id` (`cliente_id`,`tipo_documento`),
  CONSTRAINT `fk_cliente_documento` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_cliente`
--

LOCK TABLES `documentos_cliente` WRITE;
/*!40000 ALTER TABLE `documentos_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_operacoes`
--

DROP TABLE IF EXISTS `historico_operacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_operacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `tipo_operacao` varchar(100) DEFAULT NULL,
  `data_operacao` date DEFAULT NULL,
  `banco_promotora` varchar(100) DEFAULT NULL,
  `data_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_historico_cliente` (`cliente_id`),
  CONSTRAINT `fk_historico_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_operacoes`
--

LOCK TABLES `historico_operacoes` WRITE;
/*!40000 ALTER TABLE `historico_operacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_operacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propostas`
--

DROP TABLE IF EXISTS `propostas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `propostas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nome_cliente` varchar(100) NOT NULL,
  `cpf_cliente` varchar(14) NOT NULL,
  `convenio` varchar(50) DEFAULT NULL,
  `operacao_feita` varchar(50) DEFAULT NULL,
  `valor_parcela_port` decimal(10,2) DEFAULT NULL,
  `troco_estimado` decimal(10,2) DEFAULT NULL,
  `saldo_devedor_estimado` decimal(10,2) DEFAULT NULL,
  `data_retorno_saldo` date DEFAULT NULL,
  `banco` varchar(50) DEFAULT NULL,
  `promotora` varchar(50) DEFAULT NULL,
  `valor_operacao` decimal(10,2) DEFAULT NULL,
  `valor_parcela_geral` decimal(10,2) DEFAULT NULL,
  `status_proposta` varchar(50) DEFAULT NULL,
  `detalhe_status` text,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_finalizacao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `propostas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propostas`
--

LOCK TABLES `propostas` WRITE;
/*!40000 ALTER TABLE `propostas` DISABLE KEYS */;
/*!40000 ALTER TABLE `propostas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` enum('consultor','admin') DEFAULT 'consultor',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Maria Sueli','sueliadm@mscred.com','scrypt:32768:8:1$Mgjl82ZPlCDnpecC$bdf0a011d2f943c2658fe2e476444d6823a4003b44c038d51516af12ee5977587b6f5f0f5b77e3b04aff80f9704dd1b9d9d395174c8d5453c36cd1670bd4f287','admin','2026-02-08 17:40:38'),(2,'Djullian Kell','djullianadm@mscred.com','scrypt:32768:8:1$i17xpLM7oHG3fhCO$222f9246311c3c5197e98d3b9788da67d209958444e637cdbcee6d40d20b68a80ee773b7eaed57b5ac190c749d0e7ecfb1ac30e21ee1c08beddf5d48e5f71ac7','admin','2026-02-08 17:42:42'),(3,'Iraneide Antunes','neidinhaop@mscred.com','scrypt:32768:8:1$OElyJPuXCeRaz3Mj$e763194762ebcd8fe9d5da2aa02cd0bba9b6554df56bad180a8a4b2065d3c0b192e23b0ef72d7c2d97d584033544e8fbe07b4d4e32742f391c462b2dc5c09574','consultor','2026-02-08 17:51:18'),(4,'Carla Beatriz','carlaop@mscred.com','scrypt:32768:8:1$PpwcCgjoHfeFUexU$1f80b1b2582b793032c11c152e6116b032f04ecc21fba275ec5aa5c0ee6a2fa9434d4f104b2f32a8ba522f7e2d3f9cbe43a1ee045476a105bb74f9eb5e3a1854','consultor','2026-02-08 17:53:37'),(5,'João Vitor','joaovitorop@mscred.com','scrypt:32768:8:1$qwSvDOUEUrAlLJHm$b3dd8e04f178774599c666096fadeaaef14fb95e42fab3db8773d2d2759e0cfa2e91fa0585d1acbae68732cea25a512b6f00175b3256351bbc0f86c1d21b2a37','consultor','2026-02-08 17:56:29'),(6,'Kaynara Kelly','kaynaraop@mscred.com','scrypt:32768:8:1$SuAGu510hogBr668$ac6a2ff42d0cc2426f1b03c07a80f62e7f11caf358d799e776b309e34a9d227f01d71ad6f868f4bcadc4ff0059480100a0089d583d5d8534e337b55272a9e83b','consultor','2026-02-08 17:59:46'),(7,'Lucas Kauã','kauaadm@mscred.com','scrypt:32768:8:1$p7cYHdwW6lS7238j$3c5fc18ee420de0496043c1425e189d81c3ef926ae1662c06b700c7ef65b1a50a6f3b8f72c75cfe72bc6798595884802cf4cffb112f6fb3836f8bb22d3b3a2ea','admin','2026-02-08 18:02:33');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-10 11:55:49
