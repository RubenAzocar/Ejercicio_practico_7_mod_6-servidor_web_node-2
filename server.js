const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const Pelicula = require('./models/Pelicula');
const Serie = require('./models/Serie');

const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs')));

// Ruta de inicio explícita para asegurar la carga del frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Rutas
const peliculasPath = path.join(__dirname, 'data', 'peliculas.txt');
const seriesPath = path.join(__dirname, 'data', 'series.txt');

// Helper para leer archivos de forma no bloqueante
const readFileAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) resolve(''); // Retornar vacío si no hay archivo o error
            else resolve(data);
        });
    });
};

// GET: Listar películas o series
app.get('/catalogo', async (req, res) => {
    const { tipo } = req.query;

    if (tipo === 'peliculas' || tipo === 'series') {
        const filePath = tipo === 'peliculas' ? peliculasPath : seriesPath;
        try {
            const data = await readFileAsync(filePath);
            const items = data.split('\n').filter(line => line.trim() !== '').map(line => {
                const parts = line.split(',').map(p => p.trim());
                if (tipo === 'peliculas') {
                    return new Pelicula(parts[0], parts[1], Number.parseInt(parts[2]));
                } else {
                    return new Serie(parts[0], Number.parseInt(parts[1]), Number.parseInt(parts[2]));
                }
            });
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: `Error al leer el catálogo de ${tipo}` });
        }
    } else {
        res.status(400).json({ error: 'Tipo no válido. Use "peliculas" o "series".' });
    }
});

// POST: Agregar nueva película o serie
app.post('/catalogo', (req, res) => {
    const { tipo, nombre, director, anioEstreno, numeroTemporadas } = req.body;

    if (tipo === 'pelicula') {
        const nuevaPelicula = `${nombre}, ${director}, ${anioEstreno}\n`;
        fs.appendFile(peliculasPath, nuevaPelicula, (err) => {
            if (err) res.status(500).json({ error: 'Error al guardar la película' });
            else res.status(201).json({ message: 'Película agregada con éxito' });
        });
    } else if (tipo === 'serie') {
        const nuevaSerie = `${nombre}, ${anioEstreno}, ${numeroTemporadas}\n`;
        fs.appendFile(seriesPath, nuevaSerie, (err) => {
            if (err) res.status(500).json({ error: 'Error al guardar la serie' });
            else res.status(201).json({ message: 'Serie agregada con éxito' });
        });
    } else {
        res.status(400).json({ error: 'Tipo no válido. Use "pelicula" o "serie".' });
    }
});

// DELETE: Eliminar película o serie usando parámetros de URL
app.delete('/catalogo/:tipo/:nombre', (req, res) => {
    const { tipo, nombre } = req.params;
    const filePath = tipo === 'pelicula' ? peliculasPath : (tipo === 'serie' ? seriesPath : null);

    if (!filePath) {
        return res.status(400).json({ error: 'Tipo no válido. Use "pelicula" o "serie".' });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo' });

        const lines = data.split('\n').filter(Boolean);
        const filteredLines = lines.filter(line => {
            const currentName = line.split(',')[0].trim();
            return currentName.toLowerCase() !== nombre.toLowerCase();
        });

        fs.writeFile(filePath, filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''), (err) => {
            if (err) res.status(500).json({ error: 'Error al actualizar el archivo' });
            else res.status(200).json({ message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminada con éxito` });
        });
    });
});

// Rechazar cualquier otro método en /catalogo
app.all('/catalogo', (req, res) => {
    res.status(405).json({ error: 'Método no permitido. Use GET, POST o DELETE.' });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
