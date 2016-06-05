# _Today I'm Watching_ Backend Implementation

### Introduction
_Today I'm Watching_ is a web application that suggests movies available in a specific Netflix region. Movies need to have an IMDB-Rating of >7.0 to be eligible.
Users can sign up and mark movies as watched, which will prevent them from being suggested again. 
The basic backend implementation is a server-side script that runs on a cronjob schedule every night, and requests new movies from all major regions from the UNOGS-API (unofficial Netflix API). These new movies are cross-referenced with the OMDB-API to get additional information from IMDB, and then inserted into the database, along with the information of what regions they are available in.
Check the REST API below for a more detailed description on the methods available.

### Files
* `app.js`: Handles all the basic routing and database queries.
* `dbfill.js`: Script that runs on a daily basis and populates the database.
* `regions.js`: Full list of available Netflix regions, along with some additional information. Extracted from the UNOGS-API.
* `regions_short.js`: List of supported regions by our app, might be expanded in the future. The `id` field is the internal id from UNOGS, necessary for the API queries.

## Redis Database Structure

```sql
KEY movie:id JSON => Movies are stored as simple key-value pairs with the value being the object as a string
SET movie:id:regions => All movies have a set associated that stores the regions the movie is available in
HASH movies => A simple hash that maps imdb_id to id (internal DB id), so that we can look up a movie by its imdb ID
SET region:code:movies => All regions have a set that stores the movies available in that region

KEY user:id JSON => Users are stored the same way movies are
HASH users => Hash that maps username to internal DB id
SET user:id:watchlist => A user can have a watchlist that stores the imdb_ids of movies that he has already watched

KEY id:user => Incrementing user counter
KEY id:movie => Incrementing movie counter
```

## Example Database Requests
```sql
// Store a new movie
SET movie:4 '{ title: "Charlies Country", year: "2013", genre: "Drama", imdb_id: "tt3244512", imdb_rating: "7.3" }'
SADD movie:4:regions de ca us
HSET movies tt3244512 4
SADD region:de:movies tt3244512
SADD region:ca:movies tt3244512
SADD region:us:movies tt3244512

// Create a new user
SET user:10 '{ name: "User", email: "test@test.de", password: "clearpw" }'
HSET users User 10

SADD user:10:watchlist tt0898367

// Get 1 random movie (Standard API request when user is not logged in):
SRANDMEMBER region:us:movies => "tt3244512"

// Response is the IMDB id of a random movie. Get the internal database id:
HGET movies tt3244512 => 4

// Response is the internal database id. Get the movie object associated with that id:
GET movie:4 => '{ title: "Charlies Country", year: "2013", genre: "Drama", imdb_id: "tt3244512", imdb_rating: "7.3" }'

// Get the user id of a specific user given his username:
HGET users User => 10

// Add a movie to the watchlist of a given user:
SADD user:10:watchlist tt0898367

// Get movies from a specific region that are not in the watchlist of a given user:
SDIFF region:us:movies user:10:watchlist => ["tt3244512"]

```

## REST API
```http
GET /movie/:region => Returns a random movie from specified region
POST /user => Creates a new user (accepts JSON in following format)
    {
      "name": "D2Allaire",
      "email": "contact@ewitte.me",
      "password": "12345"
    }
GET /user/:id => Returns the selected user
PUT /user/:id => Updates an existing user (accepts JSON in same format as above)
POST /user/:id/watchlist => Adds one or multiple entries to a users watchlist (accepts JSON in following format)
    {
      "items": ["tt213213", "tt123213"]
    }
GET /user/:id/watchlist => Returns the watchlist of a user (array)
DELETE /user/:id/watchlist => Deletes an existing entry from a users watchlist (accepts JSON in same format as above)
GET /user/:id/movie/:region => Returns movies from a specified region that are not in the watchlist of a specified user
GET /movies/:region => Returns all movies (imdb_ids) from a specified region (array)
```
