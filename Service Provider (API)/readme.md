# _Service Provider_

### Introduction
The _service provider_ provides a RESTful API that the service consumer can utilize and exchange data with. In our case, the service provider is responsible for all data logic.  
It stores all information regarding movies, regions and users in a Redis database. A script that runs daily populates the database and keeps it up to date.

### Installation
1. `npm install` to load dependencies. 
2. Set up a `.env` file in the root folder (_/Service Provider (API)_) with the following variables:
```
API_USER=[Username used for HTTP Basic Auth, the service consumer will use this to access the API]
API_PW=[Password used for HTTP Basic Auth]
UNOGS=[UNOGS API Key, from https://market.mashape.com/unogs/unogs]
```
3. Run `/scripts/dbupdate.js` and `/scripts/dbseasons.js` once to populate the database.
4. Set up a cronjob that runs the dbupdate.js script once every 24 hours. Use [Linux's internal cronjob tool](http://stackoverflow.com/questions/5849402/how-can-you-execute-a-node-js-script-via-a-cron-job) or one of the many npm modules available.

### Files & Folders
* `app.js`: Handles initialization of the database and all routes.
* `config/db.js`: Handles database connections.
* `libs/`: contains all relevant JSON files for database population
    - `regions.js`: Full list of available Netflix regions, along with some additional information. Extracted from the UNOGS-API.
    - `regions_short.js`: List of supported regions by our app, might be expanded in the future. The `id` field is the internal id from UNOGS, necessary for the API queries.
* `models/ and routes/`: self-explanatory, contain all models and routes.
* `scripts/`: 
    - `dbupdate.js`: Script that runs on a daily basis and populates the database.
    - `dbseasons.js`: Populates the database with the seasonal movies found in /libs/seasons.
    - `parsecsv.js`: Allows you to parse your own CSV lists exported from IMDB. Utility script.

## Redis Database Structure

```sql
KEY movie:id JSON => Movies are stored as simple key-value pairs with the key being the IMDB id, and the value being the object as a string
SET movie:id:regions => All movies have a set associated that stores the regions the movie is available in
SET region:code:movies => All regions have a set that stores the movies available in that region
SET movies:season => Movies connected to a certain season (e.g. Christmas) are stored in their own sets

KEY user:id JSON => Users are stored the same way movies are
HASH users => Hash that maps username to internal DB id
SET user:id:watchlist => A user can have a watchlist that stores the imdb_ids of movies that he has already watched

KEY id:user => Incrementing user counter
```

## Example Database Requests
```sql
// Store a new movie
SET movie:tt3244512 '{ title: "Charlies Country", year: "2013", genre: "Drama", imdb_id: "tt3244512", imdb_rating: "7.3" }'
SADD movie:tt3244512:regions de ca us
SADD region:de:movies tt3244512
SADD region:ca:movies tt3244512
SADD region:us:movies tt3244512

// Create a new user
SET user:10 '{ name: "User", email: "test@test.de", password: "clearpw" }'
HSET users User 10

SADD user:10:watchlist tt0898367

// Get 1 random movie (Standard API request when user is not logged in):
SRANDMEMBER region:us:movies => "tt3244512"

// Get movies from a specific region that are not in the watchlist of a given user:
SDIFF region:us:movies user:10:watchlist => ["tt3244512"]

```

### TODO (Future updates)
- Use hashids instead of simple incrementing ids for increased security.
- Allow filtering additionally by genre.
