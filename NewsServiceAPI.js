const express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    NewsService = require('./NewsService');

const api = express(),
    newsService = new NewsService();

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

api.get(NEWS_ENDPOINT, authenticate, (req, res) => {
    res.sendFile(NEWS, { root: __dirname });
});

api.get(NEWSJS_ENDPOINT, authenticate, (req, res) => {
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
        res.status(204).end();
    } else {
        res.status(401).end();
    }
});

api.post(LOGOUT_ENDPOINT, (req, res) => {
    req.session.destroy();
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
    if (req.session && req.session.username && req.session.role) {
        next();
    } else {
        res.status(401).send(ERROR401);
    }
}