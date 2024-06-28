const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/save-gaze-data', (req, res) => {
    const data = req.body;
    fs.appendFile('gazeData.json', JSON.stringify(data) + '\n', (err) => {
        if (err) throw err;
        console.log('Gaze data saved!');
    });
    res.status(200).send('Data received');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
