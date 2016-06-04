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

SET user:10 "{ name: "User", email: "test@test.de", password: "clearpw" }"
HSET users User 10

SADD user:10:watchlist tt0898367
```

## Example Requests
```sql
// Get 5 movies (Standard API request when user is not logged in):
SRANDMEMBER region:us:movies 5 => ["tt3244512", "tt0898367", ...]

// Response is an array of 5 IMDB ids. Get the internal database id for each one:
HGET movies tt3244512 => 4

// Response is the internal database id. Get the movie object associated with that id:
GET movie:4 => '{ title: "Charlies Country", year: "2013", genre: "Drama", imdb_id: "tt3244512", imdb_rating: "7.3" }'

// Get the user id of a specific user given his username:
HGET users User => 10

// Add a movie to the watchlist of a given user:
SADD users tt0898367

// Get movies from a specific region that are not in the watchlist of a given user:
SDIFF region:us:movies user:10:watchlist => ["tt3244512"] // Nicht beschränkt auf 5 :/

```

