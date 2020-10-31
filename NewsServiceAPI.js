const express = require('express');

const api = express();

api.get('/', (req, res) => {
    res.send('Hello World!');
});

api.post('/create', (req, res) => {

});

api.post('/editTitle', (req, res) => {

});

api.post('/editContent', (req, res) => {

});

api.post('/delete', (req, res) => {

});

api.post('/search', (req, res) => {

});

api.get('/login', (req, res) => {

});

api.get('/logout', (req, res) => {

});

api.all('*', (req, res, next) => {
    res.status(404);
    res.send('404: Page not found');
});

api.use((err, req, res, next) => {
    console.error(err);
    res.status(500);
    res.send('500: Internal Server Error');
});

api.listen(3000);