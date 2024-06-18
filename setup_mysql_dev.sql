-- prepares a MySQL server for the project

SET GLOBAL validate_password.policy=LOW;
CREATE DATABASE IF NOT EXISTS tech_tales_dev_db;
CREATE USER IF NOT EXISTS 'tech_dev'@'localhost' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON `tech_tales_dev_db`.* TO 'tech_dev'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'tech_dev'@'localhost';
FLUSH PRIVILEGES;
