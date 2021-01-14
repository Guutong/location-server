const express = require('express');
const bodyParser = require('body-parser');
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');

const logDir = 'log';
const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-access.log`,
    datePattern: 'YYYY-MM-DD'
});
const dailyLocationsRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-location.log`,
    datePattern: 'YYYY-MM-DD'
});

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const consoleTransport = new transports.Console({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.printf(
            info => `${info.timestamp} ${info.message}`
        )
    )
});

const logger = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [consoleTransport, dailyRotateFileTransport]
});

const loggerLocation = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [consoleTransport, dailyLocationsRotateFileTransport]
});

const app = express();
const port = 8081

app.use(bodyParser.json());
app.post('/locations', (req, res) => {
    console.log('POST /locations batchSize:', req.body.locations.length);
    console.log('Header: ', JSON.stringify(req.headers));
    console.log('Body: ', JSON.stringify(req.body));
    logger.debug(`${req.headers['x-th-anonymous-id']}|${req.headers['content-length']}|${JSON.stringify(req.body)}`);
    (req.body.locations || []).map((loc) => {
        loggerLocation.debug(`${req.headers['x-th-anonymous-id']}|${loc.timestamp}|${loc.coords.latitude}, ${loc.coords.longitude}`);
    });
    res.send('ok');
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})