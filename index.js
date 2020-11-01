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

function logout() {
    logoutAPI();
}

function setContent(content) {
    document.getElementById('content').innerHTML = content;
}

function setHeader(header) {
    document.getElementById('header').innerHTML = header;
}

function setFailedLoginMessage() {
    document.getElementById('message').innerText = 'Incorrect Username/Password. Try again!';
}

// HTML creators
function loginForm() {
    var loginForm = `
        Username: <input type='text' value='' placeholder='Enter name here' id='username' required><br>
        Password: <input type='password' value='' id='password' required><br>
        Role: <input type='radio' value='guest' name='role' checked>Guest
        <input type='radio' value='author' name='role'>Author
        <input type='radio' value='subscriber' name='role'>Subscriber<br>
        <p id='message'></p>
        <input type='submit' id='submit'value='Login' onclick='login()'><br>`;
    setContent(loginForm);
}

function displayHeader(username, role) {
    var header = `<div><p>Welcome ${username}. You are logged in as ${role}.</p></div><p></p>
    <div><input type='button' onclick='logout()' value='Logout'></div>`
    setHeader(header);
}

function dashboard(username, role) {
    setContent('');
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
            displayHeader(username, role),
            dashboard(username, role)
        } else {
            setFailedLoginMessage();
        }
    })
    .catch((err) => console.error(err));
}

function logoutAPI() {
    fetch(HOST + LOGOUT_ENDPOINT, {
        method: 'POST'
    })
    .then((res) => {
        if (res.ok) {
            setHeader('');
            loginForm();
        }
    })
    .catch((err) => console.error(err));
}