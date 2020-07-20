CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    extra,
    privileges TEXT NOT NULL DEFAULT '',
    quota TEXT NOT NULL DEFAULT '0'
);
CREATE TABLE aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    permitted_senders TEXT
);

INSERT INTO accounts (email, password)
VALUES ('%adminEmail%@%domain%', '{SHA512-CRYPT}%password%');

INSERT INTO aliases (source, destination)
VALUES ('%postmasterAddress%', '%adminEmail%@%domain%'),
('abuse@%domain%', '%postmasterAddress%'),
('amavis@%domain%', '%postmasterAddress%'),
('root@%domain%', '%postmasterAddress%'),
('webmaster@%domain%', '%postmasterAddress%'),
('abuse@mail.%domain%', '%postmasterAddress%'),
('amavis@mail.%domain%', '%postmasterAddress%'),
('root@mail.%domain%', '%postmasterAddress%'),
('webmaster@mail.%domain%', '%postmasterAddress%');
