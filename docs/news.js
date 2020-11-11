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
    if (!ROLE || !USERNAME) {
        window.location.replace('/');
    }
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

function createNews() {
    if (ROLE !== 'author') {
        return;
    }
    var title = document.getElementById('title').value;
    var content = document.getElementById('storyContent').value;
    var date = document.getElementById('date').value;
    var isPublic = getSelectedRadioButton('isPublic') === 'true';
    createNewsAPI({ title, content, author: USERNAME, isPublic, date });
}

function getSelectedRadioButton(className) {
    var options = document.getElementsByName(className);
    for (option of options) {
        if (option.checked) {
            return option.value;
        }
    }
}

function updateTitle(id) {
    var newTitle = document.getElementById("titleInput").value;
    updateTitleAPI(id, newTitle);
}

function updateContent(id) {
    var newContent = document.getElementById("newsContentInput").value;
    updateContentAPI(id, newContent);
}

function redirectToLogin() {
    sessionStorage.clear();
    window.location.replace('/');
}

function getNewsFromStorage() {
    var news = sessionStorage.getItem('_news');
    return news && JSON.parse(news);
}

function updateStorage(news) {
    sessionStorage.setItem('_news', JSON.stringify(news));
}

function errorHandler(err) {
    console.error(err);
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
    <div><input type='button' onclick='logout()' value='Logout'></div><hr>`
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

function backButton() {
    return `<a href="#" onclick="reRenderNewsList(); return false;"><< Back</a>`;
}

function renderNews(id, news) {
    var newsString = backButton() + `
    <h2 id="title">${news.title}</h2>
    <i> Written by: ${news.author} </i> <br />
    <i> Published on ${news.date} </i>
    <br />
    
    <p id="newsContent">${news.content}</p><br />
    <div id="message"></div>`;
    if (news.author === USERNAME && ROLE === 'author') {
        newsString += `<input type="button" onclick="deleteNews(${id});" value="Delete">
        <input type="button" onclick="editTitle(${id});" value="Edit Title">
        <input type="button" onclick="editContent(${id});" value="Edit Content">`;
    }
    setContent(newsString);
}

function editTitle(id) {
    var news = getNewsFromStorage()[id];
    var title = `<input type="text" value="${news.title}" id="titleInput">
    <input type="button" onclick="updateTitle(${id});" value="Update">`;
    document.getElementById('title').innerHTML = title;
}

function editContent(id) {
    var news = getNewsFromStorage()[id];
    var content = `<input type="text" value="${news.content}" id="newsContentInput">
    <input type="button" onclick="updateContent(${id});" value="Update">`;
    document.getElementById('newsContent').innerHTML = content;
}

function setFailedDeleteMessage() {
    var message = document.getElementById('message');
    if (message !== undefined || message !== null) {
        message.innerText = 'Failed to delete news. Try again!';
    }
}

function renderCreateNewsForm() {
    var newsForm = backButton() + `<h2>Enter the story below</h2>
        <form onsubmit='event.preventDefault(); createNews();'>
            <label>Title:</label> <input type="text" id="title" /><br />
            <label>Content:</label> <br /><textarea id="storyContent" ></textarea><br />
            <label>Public?</label> 
            <input type="radio" name="isPublic" value="true" checked />Yes
            <input type="radio" name="isPublic" value="false" />No
            <br />
            <label>Date: </label><input type="datetime-local" id="date" required />
            <br />
            <input type="submit" value="Save" />
        </form>
        <form onsubmit='event.preventDefault(); reRenderNewsList();'>
            <button type="submit" >Cancel</button>
        </form>`;
    setContent(newsForm);
}

// API calls - fetch

function logoutAPI() {
    fetch(HOST + LOGOUT_ENDPOINT, {
        method: 'POST'
    })
    .then((res) => handleError(res))
    .then(() => redirectToLogin())
    .catch((err) => errorHandler(err));
}

function newsListAPI() {
    fetch(HOST + SEARCH_ENDPOINT)
    .then((res) => handleError(res))
    .then((res) => res.json())
    .then((data) => createNewsList(data))
    .catch((err) => errorHandler(err));
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
    .then((res) => handleError(res))
    .then(() => {
        delete news[id];
        updateStorage(news);
        reRenderNewsList();
    })
    .catch((err) => errorHandler(err), setFailedDeleteMessage());
}

function createNewsAPI(body) {
    if (ROLE !== 'author') {
        return;
    }
    fetch(HOST + CREATE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((res) => handleError(res))
    .then((res) => res.json())
    .then((data) => {
        var news = getNewsFromStorage();
        news[data.id] = body;
        updateStorage(news);
        reRenderNewsList();
    })
    .catch((err) => errorHandler(err));
}

function updateTitleAPI(id, title) {
    if (ROLE !== 'author' && getNewsFromStorage()[id].author !== USERNAME) {
        return;
    }
    fetch(HOST + EDIT_TITLE_ENDPOINT, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, title })
    })
    .then((res) => handleError(res))
    .then(() => {
        var news = getNewsFromStorage();
        news[id].title = title;
        updateStorage(news);
        reRenderNewsList();
    })
    .catch((err) => errorHandler(err));
}

function updateContentAPI(id, content) {
    if (ROLE !== 'author' && getNewsFromStorage()[id].author !== USERNAME) {
        return;
    }
    fetch(HOST + EDIT_CONTENT_ENDPOINT, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, content })
    })
    .then((res) => handleError(res))
    .then(() => {
        var news = getNewsFromStorage();
        news[id].content = content;
        updateStorage(news);
        reRenderNewsList();
    })
    .catch((err) => errorHandler(err));
}

function handleError(res) {
    if (!res.ok) {
        if (res.status === 401) redirectToLogin();
        throw Error(res.statusText);
    }
    return res;
}