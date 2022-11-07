const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Orion Immigration & Visa Consultants Running');
})

app.listen(port, () => {
    console.log('OIVC server running on port:', port);
})