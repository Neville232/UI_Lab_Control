const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener los datos del archivo JSON
app.get('/deMatlab', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'Matlab', 'communication', 'output.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo JSON');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            res.status(500).send('Error parseando el archivo JSON');
        }
    });
});

// Ruta para actualizar el archivo input.json
app.post('/updateInput', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'Matlab', 'communication', 'input.json');
    const newData = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo JSON');
        }

        let jsonData = JSON.parse(data);
        if (newData.port) jsonData.communicationSettings.port = newData.port;
        if (newData.baudrate) jsonData.communicationSettings.baudrate = newData.baudrate;
        if (newData.action) jsonData.communicationSettings.action = newData.action;
        if (newData.setpoint !== undefined) jsonData.systemRequirements.setpoint = newData.setpoint;
        if (newData.state) jsonData.systemRequirements.state = newData.state;

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error escribiendo el archivo JSON');
            }
            res.send('Archivo JSON actualizado');
        });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});