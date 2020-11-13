const HOST = 'http://localhost:3000',
    LOGIN_ENDPOINT = '/login',
    LOGOUT_ENDPOINT = '/logout';

function initializeContent() {
    loginForm();
}

// DOM actions
function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var role = getSelectedRadioButton('role');
    loginAPI(username, password, role);
}

function getSelectedRadioButton(className) {
    var options = document.getElementsByName(className);
    for (option of options) {
        if (option.checked) {
            return option.value;
        }
    }
}

function setContent(content) {
    document.getElementById('content').innerHTML = content;
}

function setHeader(header) {
    document.getElementById('header').innerHTML = header;
}

function setFailedLoginMessage() {
    var loginFailure = `<p>Incorrect Username/Password. Try again</p>
    <a href="#" onclick="loginForm(); return false;">Click here to login...</a>`;
    setContent(loginFailure);
}

// HTML creators
function loginForm() {
    var loginForm = `<form onsubmit='event.preventDefault(); login();'>
        Username: <input type='text' value='' placeholder='Enter name here' id='username' required><br>
        Password: <input type='password' value='' placeholder='Enter password' id='password' required><br>
        Role: <input type='radio' value='guest' name='role' checked>Guest
        <input type='radio' value='author' name='role'>Author
        <input type='radio' value='subscriber' name='role'>Subscriber<br>
        <p id='message'></p>
        <input type='submit' id='submit'value='Login'><br>
        </form>`;
    setContent(loginForm);
}

// API calls
function loginAPI(username, password, role) {
    fetch(HOST + LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            role
        })
    })
    .then((res) => {
        if (res.ok) {
            sessionStorage.setItem('_username', username);
            sessionStorage.setItem('_role', role);
            sessionStorage.setItem('_auth-key', res.headers.get('auth-token'));
            window.location.replace('/news');
        } else {
            setFailedLoginMessage();
        }
    })
    .catch((err) => console.error(err));
}