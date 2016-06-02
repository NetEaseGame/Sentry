-- MySQL dump 10.13  Distrib 5.6.23, for Linux (x86_64)
--
-- Host: localhost    Database: sentry_db
-- ------------------------------------------------------
-- Server version	5.6.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `sentry_projectkey`
--

DROP TABLE IF EXISTS `sentry_projectkey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sentry_projectkey` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) NOT NULL,
  `public_key` varchar(32) DEFAULT NULL,
  `secret_key` varchar(32) DEFAULT NULL,
  `date_added` datetime,
  `roles` bigint(20) NOT NULL,
  `label` varchar(64),
  `status` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `public_key` (`public_key`),
  UNIQUE KEY `secret_key` (`secret_key`),
  KEY `sentry_projectkey_37952554` (`project_id`),
  KEY `sentry_projectkey_48fb58bb` (`status`),
  CONSTRAINT `project_id_refs_id_e4d8a857` FOREIGN KEY (`project_id`) REFERENCES `sentry_project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sentry_projectkey`
--

LOCK TABLES `sentry_projectkey` WRITE;
/*!40000 ALTER TABLE `sentry_projectkey` DISABLE KEYS */;
INSERT INTO `sentry_projectkey` VALUES (1,1,'1c37fbd3ddbf468d8d5c525ef5029c3d','351991f239b94e95b1cdd2f9052b94c0','2016-01-15 05:29:35',1,'Default',0),(2,2,'f5e304bf564144999989d09161b76581','b5897be0333e417a8560698cf534a4c0','2016-01-15 06:09:26',1,'Default',0),(3,3,'5849f633f0bc4b5a8354216f97e9cc0d','bc2db0eccb9c4627b8e32fdbc2a58e73','2016-01-20 02:42:27',1,'Default',0),(4,4,'22e219aff09842eca5e1181bc5fbb846','de355cf39162487f93e80982bc3820bb','2016-01-20 02:46:16',1,'Default',0),(5,5,'b0b3f1430db84f0984ebe25c02cb62d3','0fec12b1d5cc4e6d99f89c9aa05826a3','2016-01-20 09:33:22',1,'Default',0),(6,6,'c24ba582df6b426bb699cb9704b31021','7cf7aff0e19a48c4be59b3c229d478ae','2016-01-20 12:02:35',1,'Default',0),(7,7,'9bcf78553ec94cd7867c72c9a80e54e9','c2aca75e105245afb9105412fbd2158a','2016-01-20 12:18:13',1,'Default',0),(8,8,'108386b56dcb431c95517bdf26571509','b208cfbc5a10461392cfda4a59ffcfb0','2016-01-20 12:44:33',1,'Default',0),(9,9,'2fda6d85619e4df79ba3861f62ddb4bd','2f4e248f34dd4aacb91ec06e6ed64e0b','2016-01-22 01:53:18',1,'Default',0),(11,11,'9487fed2c1ff44cbb6537c0aa3376534','1c97f374054548b8baa4d6fb59b8ebd4','2016-02-03 06:34:52',1,'Default',0),(12,12,'468d1542b6334708a3b216e6a662375d','b6f1ad058dfe45d9a8ea7ca9e1cf68aa','2016-03-07 12:21:24',1,'Default',0),(13,13,'2d01285ca2c84f16b7eeead35e729a6a','14185ec0289a437c82877433d94245b0','2016-03-08 10:59:48',1,'Default',0),(14,14,'8c556282e8c04d4c9113886c0f8effe8','bb0dd89e14094f6393d1aaebefc0e8ab','2016-04-11 13:51:18',1,'Default',0),(15,15,'fd52ebe7be2c4b81a21d3aa282e393e0','bd5c123bee0b4eb2b8afe85cdf5773b4','2016-04-14 07:19:41',1,'Default',0),(16,16,'4a474ea176d64f088c47f7b473e94b7f','0225a82f7256442d9159641baf852833','2016-04-28 07:46:46',1,'Default',0),(17,17,'ee7663edbf014616834705d0051b9263','bc698e2403d949a7a1d4243ba5015032','2016-04-28 08:10:39',1,'Default',0),(18,18,'b0765e61dd3e4831853719b4774aae40','874e6f36647e4eff865c3f4f3d05c0ff','2016-05-30 02:53:29',1,'Default',0),(19,19,'bbdcd5e1b8c44fe6b8e237a877285642','e31084f6b4684bc7a0b20221364ed69a','2016-06-02 08:08:48',1,'Default',0);
/*!40000 ALTER TABLE `sentry_projectkey` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-06-02 21:13:51
