const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Simulación de una "base de datos" en memoria
let productos = [
    { id: 1, nombre: 'Producto 1', precio: 100 },
    { id: 2, nombre: 'Producto 2', precio: 200 }
];

let usuarios = [
    {
        id: 1,
        username: 'admin',
        password: '$2a$10$CwTycUXWue0Thq9StjUM0uJoE/2iZRiU6bff5fHSbXszQj8o4mp3C' // password is "password"
    }
];

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

// Registro y autenticación de usuarios
app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };
    usuarios.push(user);
    res.status(201).send('Usuario registrado');
});

app.post('/login', async (req, res) => {
    const user = usuarios.find(u => u.username === req.body.username);
    if (!user) return res.status(400).send('No se puede encontrar el usuario');
    
    if (await bcrypt.compare(req.body.password, user.password)) {
        const accessToken = jwt.sign({ username: user.username }, 'your_secret_key', { expiresIn: '30m' });
        res.json({ accessToken: accessToken });
    } else {
        res.send('Contraseña incorrecta');
    }
});

// CRUD de productos con rutas protegidas
app.get('/productos', (req, res) => {
    res.json(productos);
});

app.get('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.post('/productos', authenticateToken, (req, res) => {
    const producto = {
        id: productos.length + 1,
        nombre: req.body.nombre,
        precio: req.body.precio
    };
    productos.push(producto);
    res.status(201).json(producto);
});

app.put('/productos/:id', authenticateToken, (req, res) => {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        productos[index].nombre = req.body.nombre;
        productos[index].precio = req.body.precio;
        res.json(productos[index]);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.delete('/productos/:id', authenticateToken, (req, res) => {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        productos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
