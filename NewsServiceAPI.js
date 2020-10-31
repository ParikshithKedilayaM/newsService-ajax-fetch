const express = require('express'),
    bodyParser = require('body-parser'),
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

api.post(DELETE_ENDPOINT, (req, res) => {
    var { id } = req.body;
    newsService.deleteStory(id);
    res.send('Story deleted');
});

api.get(SEARCH_ENDPOINT, (req, res) => {
    var filter = constructObject(req.query);
    var stories = newsService.getStoriesForFilter(filter);
    res.send(stories);
});

api.get(LOGIN_ENDPOINT, (req, res) => {
    
});

api.get(LOGOUT_ENDPOINT, (req, res) => {

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