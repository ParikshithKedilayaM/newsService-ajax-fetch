const HOST = 'http://localhost:3000',
    LOGOUT_ENDPOINT = '/logout',
    CREATE_ENDPOINT = '/create',
    EDIT_TITLE_ENDPOINT = '/editTitle',
    EDIT_CONTENT_ENDPOINT = '/editContent',
    DELETE_ENDPOINT = '/delete',
    SEARCH_ENDPOINT = '/search',
    LOGIN_ENDPOINT = '/login',
    ROLE = sessionStorage.getItem('_role'),
    USERNAME = sessionStorage.getItem('_username');

function initializeContent() {
    displayHeader();
    loadNewsList();
}

function setContent(content) {
    document.getElementById('content').innerHTML = content;
}

function setHeader(header) {
    document.getElementById('header').innerHTML = header;
}

function logout() {
    logoutAPI();
}

function loadNewsList() {
    newsListAPI();
}

function viewNews(id) {
    let newsList = sessionStorage.getItem('_news');
    let news = newsList && JSON.parse(newsList);
    if (news[id] && news[id].content) {
        renderNews(news[id]);
    }
}

function redirectToLogin() {
    sessionStorage.clear();
    window.location.replace('/');
}

// HTML creators

function displayHeader() {
    var header = `<div><p>Welcome ${USERNAME}. You are logged in as ${ROLE}.</p></div><p></p>
    <div><input type='button' onclick='logout()' value='Logout'></div>`
    setHeader(header);
}

function renderNewsList(news) {
    var newsList = '';
    for (let story in news) {
        if (!news[story].isPublic && (ROLE === 'guest' || (ROLE === 'author' && USERNAME !== news[story].author))) {
            news[story] = { title: news[story].title }
            newsList += `<p>${news[story].title}</p>`;
        } else {
            newsList += `<p><a href="#" onclick="viewNews(${story})">${news[story].title}</a></p>`;
        }
    }
    setContent(newsList);
    sessionStorage.setItem('_news', JSON.stringify(news));
}

function renderNews(news) {
    var news = `<hr><h2>${news.title}</h2>
    <i> Written by: ${news.author} </i> <br />
    <i> Published on ${news.date} </i>
    <br />
    
    <p>${news.content}</p><br />`
    setContent(news);
}

// API calls

function logoutAPI() {
    fetch(HOST + LOGOUT_ENDPOINT, {
        method: 'POST'
    })
    .then(() => redirectToLogin())
    .catch((err) => console.error(err));
}

function newsListAPI() {
    fetch(HOST + SEARCH_ENDPOINT)
    .then((res) => res.json())
    .then((data) => renderNewsList(data))
    .catch((err) => console.error(err));
}