const express = require('express');
const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'burguertic'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express());

// 1
app.get('/menu', (_, res) => {
    connection.query("SELECT * FROM plates;", (err, rows) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(rows);
    });
});

// 2
app.get('/menu/:id', (req, res) => {
    connection.query("SELECT * FROM plates WHERE id = ?;", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows[0]);
    });
});


// 3
app.get('/combos', (_, res) => {
    connection.query("SELECT * FROM plates WHERE tipo = 'principal';", (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows);
    });
});


// 4
app.get('/principales', (_, res) => {
    connection.query("SELECT * FROM plates WHERE tipo = 'principal';", (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows);
    });
});

// 5
app.get('/postres', (_, res) => {
    connection.query("SELECT * FROM plates WHERE tipo = 'postre';", (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows);
    });
});

// 6
app.post('/pedido', (req, res) => {
    const { productos } = req.body;

    connection.query("INSERT INTO pedidos (id_usuario, fecha, estado) VALUES (1, ?, 'pendiente');", [new Date().toISOString().slice(0, 19).replace('T', ' ')], (err, rows) => {
        if (err) return res.status(500).json(err);
        connection.query("INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES " + productos.map(x => `(${rows.insertId}, ?, ?)`).join(', ') + ";",
            productos.map(x => [parseInt(x.id), parseInt(x.cantidad)]).flat(), (err, rows) => {
                if (err) return res.status(500).json(err);
                return res.status(201).json({
                    id: rows.insertId
                });
            });
    });


    /*
    connection.query("SELECT 'id', 'precio' FROM plates WHERE id IN (?);", [productos.map(x => parseInt(x.id))], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        
        let precio = 0;

        rows.forEach((x) => {
            precio += x.precio * productos.find(y => y.id == x.id).cantidad;
        });

        res.status(200).json({
            msg: 'Pedido recibido',
            precio: precio,
        });
    });
    */
});

app.get('/pedidos/:id', (req, res) => {
    const { id } = req.params;

    connection.query("SELECT * FROM pedidos JOIN usuarios ON pedidos.id_usuario = usuarios.id WHERE pedidos.id_usuario = ?;",
        [parseInt(id)],
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            let response = [];
            rows.forEach(x => {
                connection.query("SELECT plates.id, plates.nombre, plates.precio, pedidos_plates.cantidad FROM pedidos JOIN pedidos_platos ON plato.id = pedidos_platos.id_plato WHERE pedidos_platos.id_pedido = ?", [x.id], (err, rows) => {
                    response.push(
                        {
                            id: x.id,
                            fecha: x.fecha,
                            estado: x.estado,
                            id_usuario: id,
                            platos: rows
                        }
                    )
                })
            })
            return res.status(200).json(response);
        });
});

app.listen(9000, () => {
    console.log('Escuchando en puerto 9000');
});