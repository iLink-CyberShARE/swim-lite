--
-- Database: swim-users
-- ------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `swim-users` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
USE `swim-users` ;

-- -----------------------------------------------------
-- Table `swim-users`.`USER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `swim-users`.`USER` (
  `uid` INT NOT NULL AUTO_INCREMENT,
  `uemail` VARCHAR(200) UNIQUE NOT NULL COMMENT 'unique email address',
  `upassword` VARCHAR(300) NOT NULL COMMENT 'encrypted password, recommender system uses sha1 hash, better hash function recommended for production environments',
  `ufirst_name` VARCHAR(100) NOT NULL COMMENT 'first name of the user',
  `ulast_name` VARCHAR(100) NOT NULL COMMENT 'last name of the user',
  `uinstitution` VARCHAR(200) NULL COMMENT 'name of affiliated organization, institution or company',
  `udepartment` VARCHAR(200) NULL COMMENT 'name of department at organization',
  `urole` VARCHAR(200) NULL COMMENT 'type of stakeholder role',
  `is_guest` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'flag to check if the user is guest, this flag is not currently used for recommender endpoint access.',
  `is_contentmanager` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'flag to check if the user is a content manager, used for endpoint authorization on model training and crud operations',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'flag to check if the user account is currently active or disabled',
  PRIMARY KEY (`uid`))
ENGINE = InnoDB;


