import express from 'express';
import { DHT22, Reading } from './DHT22';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 80;
const dht = new DHT22();
const READ_INTERVAL = 10 * 60 * 1000;  // How often to read the sensor and store a record
let lastReading: Reading;
let currentReadings: string;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/temp-rh', (req, res) => {
    // console.log(req.headers);
    if (lastReading) {
        res.json(lastReading);
    } else {
        const result = dht.getTempAndRH();
        if (result) {
            lastReading = result;
        }
        res.json(result);
    }
});

app.get('/readings', (req, res) => {
    if (currentReadings) {
        res.send(currentReadings);
    } else {
        res.status(400).send('Error getting readings');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// if the data file doesn't exist then create it
// Also initialize currentReadings
if (!fs.existsSync('data/readings.csv')) {
    const headerRow = 'time,temp,rh\n';
    currentReadings = headerRow;
    fs.writeFileSync('data/readings.csv', headerRow);
} else {
    const data = fs.readFileSync('data/readings.csv',);
    currentReadings = data.toString();
}

setInterval(() => {
    const reading = dht.getTempAndRH();
    if (!reading) {
        return;
    }
    lastReading = reading;

    const now = Date.now();
    const newRow = `${now},${reading.temp},${reading.rh}\n`;
    currentReadings = currentReadings + newRow;

    fs.appendFile('data/readings.csv', newRow, (err) => {
        if (err) throw err;
        console.log(`Row ${newRow} was appended to file!`);
    });
}, READ_INTERVAL);
