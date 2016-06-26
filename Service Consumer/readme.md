# _Service User_

### Introduction
The _service consumer_ is responsible for rendering the actual page, and managing all User interactions. It makes requests to the API, does some calculations or transformations on the data if necessary, and uses it to populate the page. 

### Installation
1. `npm install` to load dependencies. 
2. Set up a `.env` file in the root folder (_/Service Provider (API)_) with the following variables:
```
API_USER=[Username used for HTTP Basic Auth with the API]
API_PW=[Password used for HTTP Basic Auth]
```
### Files & Folders
* `app.js`: Handles initialization of the database and all routes.

