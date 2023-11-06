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
    connection.query("SELECT * FROM platos;", (err, rows) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(rows);
    });
});

// 2
app.get('/menu/:id', (req, res) => {
    connection.query("SELECT * FROM platos WHERE id = ?;", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows[0]);
    });
});


// 3
app.get('/combos', (_, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'principal';", (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows);
    });
});


// 4
app.get('/principales', (_, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'principal';", (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0)
            return res.sendStatus(404);
        res.status(200).json(rows);
    });
});

// 5
app.get('/postres', (_, res) => {
    connection.query("SELECT * FROM platos WHERE tipo = 'postre';", (err, rows) => {
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
    connection.query("SELECT 'id', 'precio' FROM platos WHERE id IN (?);", [productos.map(x => parseInt(x.id))], (err, rows) => {
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

    connection.query("SELECT pedidos.id as id_pedido, pedidos.fecha, pedidos.estado, platos.id as id_plato, platos.nombre, platos.precio, pedidos_platos.cantidad FROM pedidos JOIN pedidos_platos ON pedidos.id = pedidos_platos.id_pedido JOIN platos ON pedidos_platos.id_plato = platos.id WHERE pedidos.id_usuario = ?;",
        [parseInt(id)],
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            let response = [];
            rows.forEach(x => {
                let i = response.findIndex(y => y.id == x.id_pedido)
                if (i == -1)
                {
                    response.push(
                    {
                        id: x.id_pedido,
                        fecha: x.fecha,
                        estado: x.estado,
                        id_usuario: id,
                        platos: []
                    }
                    );
                    i = response.length-1;
                }
                response[i].platos.push(
                    {
                        id: x.id_plato,
                        nombre: x.nombre,
                        precio: x.precio,
                        cantidad: x.cantidad
                    }
                );
            })
            return res.status(200).json(response);
        });
});

app.listen(9000, () => {
    console.log('Escuchando en puerto 9000');
});