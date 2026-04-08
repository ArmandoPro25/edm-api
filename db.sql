-- MYSQL
CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    lastName VARCHAR(300) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password LONGTEXT NOT NULL,
    refreshToken LONGTEXT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    email VARCHAR(100) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (username),
    UNIQUE (email)
);

CREATE TABLE task (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(200) NOT NULL,
    priority INT NOT NULL,
    user_id INT NOT NULL,
    completed TINYINT(1) NOT NULL,
    dateVencimiento VARCHAR(150) NOT NULL,

    PRIMARY KEY (id),
    INDEX (user_id),
    CONSTRAINT fk_task_user
        FOREIGN KEY (user_id) REFERENCES user(id)
);

INSERT INTO user (name, lastName, username, password, email)
VALUES ('Armando', 'Ruano', 'Armando2498q', 'linux', 'armando.ruano.dev@gmail.com');

INSERT INTO task (name, description, priority, user_id) VALUES ('SCRIPT VIGENCIA', 
'TRABAJAR SCRIPT PARA MODIFICAR LOS USUARIOS - PETICION TODOS LOS USUARIOS COMO INDEFINIDOS -> SOLO A USUARIOS QUE NO SEAN GLOBALES', true, 1);

INSERT INTO tasks (name, description, priority, user_id) VALUES ('PERFIL GLOBAL', 'USUARIOS ADMINISTRADORES O PERFIL GLOBAL -SE DEBE DESAPARECER FORULARIO DE SI ES INDEFINIDO O NO.', false, 1);