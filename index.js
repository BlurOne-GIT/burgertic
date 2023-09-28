const menu = require('./menu');
const express = require('express');

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express());

// 1
app.get('/menu', (_, res) => {
    res.status(200).json(menu);
});

// 2
app.get('/menu/:id', (req, res) => {
    const entry = menu.find((x) => x.id === parseInt(req.params.id));

    if (entry)
        res.status(200).json(entry);
    else
        res.sendStatus(404);
});

// 3
app.get('/combos', (_, res) => {
    const entries = menu.filter((x) => x.tipo === 'combo');

    if (entries)
        res.status(200).json(entries);
    else
        res.sendStatus(404);
});

// 4
app.get('/principales', (_, res) => {
    const entries = menu.filter((x) => x.tipo === 'principal');

    if (entries)
        res.status(200).json(entries);
    else 
        res.sendStatus(404);
});

// 5
app.get('/postres', (_, res) => {
    const entries = menu.filter((x) => x.tipo === 'postre');

    if (entries)
        res.status(200).json(entries);
    else
        res.sendStatus(404);
});

// 6
app.post('/pedido', (req, res) => {
    const { productos } = req.body;
    let precio = 0;

    productos.forEach((x) => {
        const producto = menu.find(y => y.id === parseInt(x.id))

        if (!producto || parseInt(x.cantidad) < 0)
            return res.sendStatus(400);
        
        precio += producto.precio * parseInt(x.cantidad);
    });

    res.status(200).json({
        msg: 'Pedido recibido',
        precio: precio,
    })
});

app.listen(3000, () => {
    console.log('Escuchando en puerto 3000');
});