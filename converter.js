const menu = require('./menu');
const mysql2 = require('mysql2');

const plates = menu.filter((x) => x.tipo !== 'combo');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'burguertic'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

plates.forEach(element => {
    connection.query("INSERT INTO plates (id, nombre, precio, descripcion, tipo) VALUES (?, ?, ?, ?, ?);", [element.id, element.nombre, element.precio, element.descripcion, element.tipo], (err, rows) => {
        console.log(err);
        console.log(rows);
    });
});