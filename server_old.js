const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Esta lista actuará como nuestra "base de datos" en memoria para simplificar el ejemplo
let productos = [
    { id: 1, nombre: 'Producto 1', precio: 100 },
    { id: 2, nombre: 'Producto 2', precio: 200 }
];

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.json(productos);
});

// Obtener un producto específico por ID
app.get('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Agregar un nuevo producto
app.post('/productos', (req, res) => {
    const producto = {
        id: productos.length + 1,  // Genera un nuevo ID; en una aplicación real, la base de datos haría esto.
        nombre: req.body.nombre,
        precio: req.body.precio
    };
    productos.push(producto);
    res.status(201).json(producto);
});

// Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        productos[index].nombre = req.body.nombre;
        productos[index].precio = req.body.precio;
        res.json(productos[index]);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        productos.splice(index, 1);
        res.status(204).send();  // No content to send back
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
