const fs = require('node:fs');
const path = require('node:path');
const seriesFile = path.join(__dirname, '../../data/series.txt');

const getSeries = (req, res) => {
    fs.readFile(seriesFile, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo de series' });
            return;
        }
        const series = data.split('\n').filter(Boolean).map(line => {
            const [name, year, seasons] = line.split(', ');
            return { nombre: name.trim(), anioEstreno: Number.parseInt(year.trim()), numeroTemporadas: Number.parseInt(seasons.trim()) };
        });
        res.json(series);
    });
};

const addSeries = (req, res) => {
    const { nombre, anioEstreno, numeroTemporadas } = req.body;
    const newSeries = `${nombre}, ${anioEstreno}, ${numeroTemporadas}\n`;
    fs.appendFile(seriesFile, newSeries, err => {
        if (err) {
            res.status(500).json({ error: 'Error al guardar la serie' });
            return;
        }
        res.status(201).json({ message: 'Serie agregada exitosamente' });
    });
};

const deleteSeries = (req, res) => {
    const seriesName = decodeURIComponent(req.params.name);
    fs.readFile(seriesFile, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo de series' });
            return;
        }
        const lines = data.split('\n').filter(Boolean);
        const filteredLines = lines.filter(line => {
            const currentName = line.split(',')[0].trim();
            return currentName.toLowerCase() !== seriesName.toLowerCase();
        });
        fs.writeFile(seriesFile, filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''), err => {
            if (err) {
                res.status(500).json({ error: 'Error al eliminar la serie' });
                return;
            }
            res.json({ message: 'Serie eliminada exitosamente' });
        });
    });
};

module.exports = { getSeries, addSeries, deleteSeries };
