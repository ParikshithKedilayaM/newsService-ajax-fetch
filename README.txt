Activity 1 API documentation:

1. NewsServiceAPI.js - This is the file that contains API 7 endpoints that is being served. 
  i. create => Adds story to the persistence store. While adding it generates a unique id for a news story. Returns id - int (to uniquely identify the news service in the persistence store)
    Endpoint: http://localhost:3000/create
    Method: POST
    Authentication: Required
    Auth-type: API Key, session
    Params:
        title    - string
        content  - string
        author   - string
        isPublic - boolean
        date - Any valid Javascript Date object format:
            ISO Date	"2015-03-25" (The International Standard)
            Short Date	"03/25/2015"
            Long Date	"Mar 25 2015" or "25 Mar 2015"
    Request Example: 
        Content-Type: application/json
        body: {
            "title"    : "New Title",
            "author"   : "New Author",
            "content"  : "New Content",
            "date"     : "10/31/2020",
            "isPublic" : true
        }
    HTTP Responses: 
        201 - OK
        401 - Unauthorized
        405 - Wrong method invoked
    Response Example:
        Response.status : 201
        Response.body   : { id : 20 }
    
  ii. editTitle - Updates new Title for news story identified using id.
    Endpoint: http://localhost:3000/editTitle
    Method: PATCH
    Authentication: Required
    Auth-type: API Key, session
    Params:
        id - int (News story's id)
        title - string
    Request Example:
        Content-Type: application/json
        body: {
            "id": 20,
            "title": "Update title"
        }
    HTTP Responses: 
        201 - OK
        401 - Unauthorized
        404 - id not found
        405 - Wrong method invoked
    Response Example:
        Response.status : 201

    iii. editContent - updates content for news story
    Endpoint: http://localhost:3000/editContent
    Method: PATCH
    Authentication: Required
    Auth-type: API Key, session
    Params:
        id - int (News story's id)
        content - string
    Request Example:
        Content-Type: application/json
        body: {
            "id": 20,
            "content": "Update content"
        }
    HTTP Responses: 
        201 - OK
        401 - Unauthorized
        404 - id not found
        405 - Wrong method invoked
    Response Example:
        Response.status : 201

  iv. delete - deletes news story identified using id
    Endpoint: http://localhost:3000/delete
    Method: DELETE
    Authentication: Required
    Auth-type: API Key, session
    Params:
        id - int (News story's id)
    Request Example:
        Content-Type: application/json
        body: {
            "id": 20
        }
    HTTP Responses: 
        204 - OK
        401 - Unauthorized
        404 - id not found
        405 - Wrong method invoked
    Response Example:
        Response.status : 204

  v. search - To filter news stories and get a Map {id: NewsStory{title, content, author, isPublic, date} }.
              Returns a map with all {news story id - NewsStory object}
    Endpoint: http://localhost:3000/search
    Optional Query Params: 
        ?title=Update title
        ?author=New Author
        ?startDate=10/30/2020&endDate=10/10/2021
        ?title=Update title&author=New Author
        ?title=Update title&startDate=10/30/2020&endDate=10/10/2021
        ?author=New Author&startDate=10/30/2020&endDate=10/10/2021
        ?title=Update title&author=New Author&startDate=10/30/2020&endDate=10/10/2021
    Method: PUT
    Authentication: Required
    Auth-type: API Key, session
    Params:
        title : string,
        author : string,
        startDate: "valid javascript date obj format"
        endDate: "valid javascript date obj format"
    HTTP Responses: 
        200 - OK
        401 - Unauthorized
        405 - Wrong method invoked
        500 - Internal Server Error with Error message
    Response Example:
        Response.status : 200

  vi. login => Logs in to the application by authenticating user. Response has auth-token in header and connect.sid as cookie
    Endpoint: http://localhost:3000/login
    Method: POST
    Authentication: None
    Auth-type: None
    Params:
        username - string
        password - string
        role     - string (author/guest/subscriber)
    Request Example: 
        Content-Type: application/json
        body: {
            "username" : "TestUser",
            "password" : "TestUser",
            "role"     : "author"
        }
    HTTP Responses: 
        204 - OK
        405 - Wrong method invoked
    Response Example:
        Response.status : 204
        Response.header : { 'auth-token' : '124343a7c7d34455245556ada423' } 
  
  vii. logout => Logs out of the application, destroys session and token
    Endpoint: http://localhost:3000/logout
    Method: POST
    Authentication: None
    Auth-type: API Key, session
    HTTP Responses: 
        204 - OK
        405 - Wrong method invoked
    Response Example:
        Response.status : 204
        

2. persistencestore.json
All news stories are stored in persistencestore.json in json format.


Pre-Requisites:
1. node installed on the computer
2. npm installed on the computer

To Run the server:
1. Install all dependencies by running:
    npm install
2. Start the server by the following command:
    npm start
3. Open http://localhost:3000 on the web browser to see the login page

Activity 1 Test cases:
{Optional} - To run execute: node NewsService_test.js (Given by professor)

Postman:
    1. Open Postman and import NewsService_test.json given.
    2. Run the server (See previous section)
    3. Open Runner (Button next to Import)
    4. Select NewsService_test 
    5. Click on 'Run NewsService_test'
    6. There are 14 test cases (4 additional than asked), all should pass.
    7. Alternatively you can run each test case individually, but the sequence of test cases matters, such as create to run before all tests.

Extra Credits:
1. Edit Title and Edit Content options are available along with Delete button for the author of the story only.
2. By default, any user with 3 minutes of inactivity will be logged out on the server. i.e., the user can view the loaded pages, but cannot do any api calls to the server without authentication again.

Authentication:
Upon login, a new session with 3 minutes timer and an auth-token with 3 minutes expiration time is generated. Both the tokens are rolling on every subsequent requests and will be invalidated on 3 minutes of inactivity. Session exchange mechanism takes place using express-session middleware. So a cookie named 'connect.sid' is transfered back and forth in requests. Token is sent as 'auth-token' in the header of the requests and will be stored in the application state.