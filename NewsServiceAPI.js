const express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    Hashes = require('jshashes'),
    Timeout = require('smart-timeout'),
    NewsService = require('./NewsService');

const api = express(),
    SHA256 =  new Hashes.SHA256,
    newsService = new NewsService();

var authTokens = {};

const ROOT_ENDPOINT = '/',
    INDEXJS_ENDPOINT = '/index.js',
    NEWS_ENDPOINT = '/news',
    NEWSJS_ENDPOINT = '/news.js',
    CREATE_ENDPOINT = '/create',
    EDIT_TITLE_ENDPOINT = '/editTitle',
    EDIT_CONTENT_ENDPOINT = '/editContent',
    DELETE_ENDPOINT = '/delete',
    SEARCH_ENDPOINT = '/search',
    LOGIN_ENDPOINT = '/login',
    LOGOUT_ENDPOINT = '/logout',
    ERROR404 = '404: Resource Not Found',
    ERROR405 = '405: Method Not Allowed',
    ERROR500 = '500: Internal Server Error',
    ERROR401 = '401: User Logged Out / Not Logged In. Please Login!',
    NEWS_STORY_NOT_FOUND = 'NewsStoryNotFound',
    AUTH_TOKEN = 'auth-token',
    INDEX = '/docs/index.html',
    INDEXJS = '/docs/index.js',
    NEWSJS = '/docs/news.js',
    NEWS = '/docs/news.html';

// Inititialize body-parser middleware
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

// Initialize session management middleware
api.use(session({
    secret: 'MAGICALEXPRESSKEY',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 3 * 60 * 1000
    }
}));

api.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

api.get(ROOT_ENDPOINT, (req, res) => {
    res.sendFile(INDEX, { root: __dirname });
});

api.get(INDEXJS_ENDPOINT, (req, res) => {
    res.sendFile(INDEXJS, { root: __dirname });
});

api.get(NEWS_ENDPOINT, (req, res) => {
    res.sendFile(NEWS, { root: __dirname });
});

api.get(NEWSJS_ENDPOINT, (req, res) => {
    res.sendFile(NEWSJS, { root: __dirname });
});

api.post(CREATE_ENDPOINT, authenticate, (req, res) => {
    var { title, content, author, isPublic, date } = req.body;
    var id = newsService.addStory(title, content, author, isPublic, date);
    res.status(201).send(JSON.stringify({ id }));
});

api.patch(EDIT_TITLE_ENDPOINT, authenticate, (req, res) => {
    var { id, title } = req.body;
    try {
        newsService.updateTitle(id, title);
        res.status(201).end();
    } catch (err) {
        if (err.message.includes(NEWS_STORY_NOT_FOUND)) {
            res.status(404).send(ERROR404);
        } else {
            throw err;
        }
    }
});

api.patch(EDIT_CONTENT_ENDPOINT, authenticate, (req, res) => {
    var { id, content } = req.body;
    try {
        newsService.updateContent(id, content);
        res.status(201).send();
    } catch (err) {
        if (err.message.includes(NEWS_STORY_NOT_FOUND)) {
            res.status(404).send(ERROR404);
        } else {
            throw err;
        }
    }
});

api.delete(DELETE_ENDPOINT, authenticate, (req, res) => {
    var { id } = req.body;
    try {
        newsService.deleteStory(id);
        res.status(204).end();
    } catch (err) {
        if (err.message.includes(NEWS_STORY_NOT_FOUND)) {
            res.status(404).send(ERROR404);
        } else {
            throw err;
        }
    }
});

api.get(SEARCH_ENDPOINT, authenticate, (req, res) => {
    try {
        var filter = constructObject(req.query);
        var stories = newsService.getStoriesForFilter(filter);
        res.status(200).send(stories);
    } catch (err) {
        res.status(500).send(err.message);
    }

});

api.post(LOGIN_ENDPOINT, (req, res) => {
    if (req.body.username === req.body.password) {
        req.session.username = req.body.username;
        req.session.role = req.body.role;
        var token = generateAuthToken(req);
        authTokens[token] = { 
            username: req.body.username,
            role: req.body.role
        };
        res.set('Auth-Token', token);
        Timeout.create(token, () => expireToken(token), 3 * 60 * 1000);
        res.status(204).end();
    } else {
        res.status(401).end();
    }
});

api.post(LOGOUT_ENDPOINT, (req, res) => {
    req.session.destroy();
    expireToken(req.headers[AUTH_TOKEN]);
    res.status(204).end();
});

api.all('*', (req, res, next) => {
    if ([CREATE_ENDPOINT, EDIT_TITLE_ENDPOINT, EDIT_CONTENT_ENDPOINT, DELETE_ENDPOINT, 
        SEARCH_ENDPOINT, LOGIN_ENDPOINT, LOGOUT_ENDPOINT].includes(req.url)) {
        res.status(405).send(ERROR405);
    } else {
        res.status(404).send(ERROR404);
    }
});

api.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(ERROR500);
});

api.listen(3000);

function constructObject(filter) {
    if (filter.startDate !== undefined || filter.endDate !== undefined) {
        filter['dateRange'] = {
            startDate: filter.startDate,
            endDate: filter.endDate
        };
    }
    return filter;
}

function authenticate(req, res, next) {
    var token = req.headers[AUTH_TOKEN];
    if (token && authTokens[token] && Timeout.exists(token) && Timeout.pending(token) &&
        req.session && req.session.username === authTokens[token].username &&
        req.session.role === authTokens[token].role) {
        Timeout.restart(token);
        next();
    } else {
        res.status(401).send(ERROR401);
    }
}

function generateAuthToken(req) {
    var username = req.body.username;
    var role = req.body.role;
    var time = new Date().toString();
    var salt = Math.floor((Math.random() * 10000) + 1);
    return SHA256.hex(username + role + time + salt);
}

function expireToken(token) {
    delete authTokens[token];
    Timeout.clear(token, erase = true);
}