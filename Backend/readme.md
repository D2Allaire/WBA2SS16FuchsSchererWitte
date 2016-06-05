# _Today I'm Watching_ Backend Implementation


## Redis Database Structure

```sql
SET movie:4 '{ title: "Charlies Country", year: "2013", genre: "Drama", imdb_id: "tt3244512", imdb_rating: "7.3" }'
SADD movie:4:regions de ca us
HSET movies tt3244512 4
SADD region:de:movies tt3244512
SADD region:ca:movies tt3244512
SADD region:us:movies tt3244512

SET movie:5 '{ title: "The Road", year: "2009", genre: "Adventure, Drama", imdb_id: "tt0898367", imdb_rating: "7.3" }'
SADD movie:5:regions de se uk
HSET movies tt0898367 5
SADD region:de:movies tt0898367
SADD region:se:movies tt0898367
SADD region:us:movies tt0898367

SET user:10 '{ name: "User", email: "test@test.de", password: "clearpw" }'
HSET users User 10

SADD user:10:watchlist tt0898367
```

## Example Database Requests
```sql
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
      "email": "contact@ewitte.me"
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
