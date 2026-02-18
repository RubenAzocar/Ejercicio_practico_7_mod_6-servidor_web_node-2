const fs = require('node:fs');
const path = require('node:path');
const moviesFile = path.join(__dirname, '../../data/peliculas.txt');

const getMovies = (req, res) => {
    fs.readFile(moviesFile, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo de películas' });
            return;
        }
        const movies = data.split('\n').filter(Boolean).map(line => {
            const [name, director, year] = line.split(', ');
            return { nombre: name.trim(), director: director.trim(), anioEstreno: Number.parseInt(year.trim()) };
        });
        res.json(movies);
    });
};

const addMovie = (req, res) => {
    const { nombre, director, anioEstreno } = req.body;
    const newMovie = `${nombre}, ${director}, ${anioEstreno}\n`;
    fs.appendFile(moviesFile, newMovie, err => {
        if (err) {
            res.status(500).json({ error: 'Error al guardar la película' });
            return;
        }
        res.status(201).json({ message: 'Película agregada exitosamente' });
    });
};

const deleteMovie = (req, res) => {
    const movieName = decodeURIComponent(req.params.name);
    fs.readFile(moviesFile, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo de películas' });
            return;
        }
        const lines = data.split('\n').filter(Boolean);
        const filteredLines = lines.filter(line => {
            const currentName = line.split(',')[0].trim();
            return currentName.toLowerCase() !== movieName.toLowerCase();
        });
        fs.writeFile(moviesFile, filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''), err => {
            if (err) {
                res.status(500).json({ error: 'Error al eliminar la película' });
                return;
            }
            res.json({ message: 'Película eliminada exitosamente' });
        });
    });
};

module.exports = { getMovies, addMovie, deleteMovie };
