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

function logout() {
    logoutAPI();
}

function loadNewsList() {
    newsListAPI();
}

function viewNews(id) {
    let news = getNewsFromStorage();
    if (news[id] && news[id].content) {
        renderNews(id, news[id]);
    }
}

function createNewsList(news) {
    renderNewsList(news);
    sessionStorage.setItem('_news', JSON.stringify(news));
}

function reRenderNewsList() {
    renderNewsList(getNewsFromStorage());
}

function deleteNews(id) {
    var news = getNewsFromStorage();
    if (ROLE === 'author' && USERNAME === news[id].author) {
        deleteNewsAPI(news, id);
    }
}

function newsForm() {
    if (ROLE === 'author') {
        renderCreateNewsForm();
    }
}

function redirectToLogin() {
    sessionStorage.clear();
    window.location.replace('/');
}

function getNewsFromStorage() {
    var news = sessionStorage.getItem('_news');
    return news && JSON.parse(news);
}

// DOM modification functions

function setContent(content) {
    document.getElementById('content').innerHTML = content;
}

function setHeader(header) {
    document.getElementById('header').innerHTML = header;
}

function displayHeader() {
    var header = `<div><p>Welcome ${USERNAME}. You are logged in as ${ROLE}.</p></div><p></p>
    <div><input type='button' onclick='logout()' value='Logout'></div>`
    setHeader(header);
}

function renderNewsList(news) {
    var newsList = '';
    if (ROLE === 'author') {
        newsList = `<div><input type="button" onclick="newsForm()" value="Create News"></div>`;
    }
    for (let story in news) {
        if (!news[story].isPublic && (ROLE === 'guest' || (ROLE === 'author' && USERNAME !== news[story].author))) {
            news[story] = { title: news[story].title }
            newsList += `<p>${news[story].title}</p>`;
        } else {
            newsList += `<p><a href="#" onclick="viewNews(${story}); return false;">${news[story].title}</a></p>`;
        }
    }
    setContent(newsList);
}

function renderNews(id, news) {
    var newsString = `<hr>
    <h2>${news.title}</h2>
    <i> Written by: ${news.author} </i> <br />
    <i> Published on ${news.date} </i>
    <br />
    
    <p>${news.content}</p><br />
    <div id="message"></div>`;
    if (news.author === USERNAME && ROLE === 'author') {
        newsString += `<input type="button" onclick="deleteNews(${id});" value="Delete">`;
    }
    setContent(newsString);
}

function setFailedDeleteMessage() {
    var message = document.getElementById('message');
    if (message !== undefined || message !== null) {
        message.innerText = 'Failed to delete news. Try again!';
    }
}

function renderCreateNewsForm() {
    console.log("// TODO");
}

// API calls - fetch

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
    .then((data) => createNewsList(data))
    .catch((err) => console.error(err));
}

function deleteNewsAPI(news, id) {
    if (ROLE !== 'author' || USERNAME !== news[id].author) {
        setFailedDeleteMessage();
        return;
    }
    fetch(HOST + DELETE_ENDPOINT, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(() => {
        delete news[id];
        sessionStorage.setItem('_news', JSON.stringify(news));
        reRenderNewsList();
    })
    .catch(() => setFailedDeleteMessage());
}