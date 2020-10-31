const express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    NewsService = require('./NewsService');

const api = express(),
    newsService = new NewsService();

const ROOT_ENDPOINT = '/',
    CREATE_ENDPOINT = '/create',
    EDIT_TITLE_ENDPOINT = '/editTitle',
    EDIT_CONTENT_ENDPOINT = '/editContent',
    DELETE_ENDPOINT = '/delete',
    SEARCH_ENDPOINT = '/search',
    LOGIN_ENDPOINT = '/login',
    LOGOUT_ENDPOINT = '/logout',
    ERROR404 = '404: Page Not Found',
    ERROR500 = '500: Internal Server Error';

// Inititialize body-parser middleware
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

// Initialize session management middleware
api.use(session({
    secret: 'MAGICALEXPRESSKEY',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3 * 60 * 1000
    }
}));

api.get(ROOT_ENDPOINT, (req, res) => {
    res.send('Hello World!');
});

api.post(CREATE_ENDPOINT, (req, res) => {
    var { title, content, author, isPublic, date } = req.body;
    var id = newsService.addStory(title, content, author, isPublic, date);
    res.send('Story created with id = ' + id);
});

api.patch(EDIT_TITLE_ENDPOINT, (req, res) => {
    var { id, title } = req.body;
    newsService.updateTitle(id, title);
    res.send('Updated title');
});

api.patch(EDIT_CONTENT_ENDPOINT, (req, res) => {
    var { id, content } = req.body;
    newsService.updateTitle(id, content);
    res.send('Updated content');
});

api.delete(DELETE_ENDPOINT, (req, res) => {
    var { id } = req.body;
    newsService.deleteStory(id);
    res.send('Story deleted');
});

api.get(SEARCH_ENDPOINT, (req, res) => {
    var filter = constructObject(req.query);
    var stories = newsService.getStoriesForFilter(filter);
    res.send(stories);
});

api.post(LOGIN_ENDPOINT, (req, res) => {
    if (req.body.username === req.body.password) {
        req.session.username = req.body.username;
        req.session.role = req.body.role;
        res.send('Login Successful');
    } else {
        res.send('Login Failed');
    }
});

api.post(LOGOUT_ENDPOINT, (req, res) => {
    req.session.destroy();
    res.send('Logged out');
});

api.all('*', (req, res, next) => {
    res.status(404);
    res.send(ERROR404);
});

api.use((err, req, res, next) => {
    console.error(err);
    res.status(500);
    res.send(ERROR500);
});

api.listen(3000);

function constructObject(filter) {
    if (filter.dateRange !== undefined) {
        filter.dateRange = JSON.parse(filter.dateRange);
    }
    return filter;
}