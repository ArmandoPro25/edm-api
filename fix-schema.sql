-- Eliminar tabla refreshtoken si existe
DROP TABLE IF EXISTS `refreshtoken`;

-- Agregar columna refreshToken a la tabla User
ALTER TABLE `User` ADD COLUMN `refreshToken` LONGTEXT NULL;
