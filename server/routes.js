var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


/* ---- Q1a (Dashboard) ---- */
function getAllGenres(req, res) {
  var query = `select distinct genre from Genres order by genre`;

  connection.query(query, function(err, rows, fields) {
    if (err) {console.log(err);
    } else {
      res.json(rows);
    }
  });
};


/* ---- Q1b (Dashboard) ---- */
function getTopInGenre(req, res) {
  const genreName = req.params.genre;
  var query = `
              select id, title, rating, vote_count from Movies where id 
              in (select movie_id from Genres where genre = '${genreName}') 
              order by rating desc, vote_count desc limit 10;
              `
  connection.query(query, function(err, rows, fields) {
    if (err) {console.log(err);
    } else {
      res.json(rows);
    }    
  });
};

/* ---- Q2 (Recommendations) ---- */
function getRecs(req, res) {
  const targetMovie = req.params.target_movie;
  var query = `with 
                tmp0 as (select id from Movies where title = '${targetMovie}'),
                tmp1 as (select genre from Genres 
                where
                movie_id = (select id from Movies where title = 'Tales of Terror')),
                tmp2 as (select distinct Genres.movie_id from Genres where genre in (select genre from tmp1) and Genres.movie_id != (select id from tmp0)),
                tmp3 as (select tmp2.movie_id, genre from tmp2 left join Genres on tmp2.movie_id = Genres.movie_id),
                tmp4 as (select tmp1.genre, movie_id from tmp1 left join tmp3 on tmp1.genre = tmp3.genre where movie_id is not null),
                tmp5 as (select movie_id, count(genre) as n from tmp4 group by movie_id having n >3) 
              select title, id, rating, vote_count from Movies where id in (select movie_id from tmp5) order by rating desc, vote_count desc limit 5;`

  connection.query(query, function(err, rows, fields) {
    if (err) {console.log(err);
    } else {
      res.json(rows);
    }    
  });
};

/* ---- (Best Genres) ---- */
function getDecades(req, res) {
	var query = `
    SELECT DISTINCT (FLOOR(year/10)*10) AS decade
    FROM (
      SELECT DISTINCT release_year as year
      FROM Movies
      ORDER BY release_year
    ) y
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

/* ---- Q3 (Best Genres) ---- */
function bestGenresPerDecade(req, res) {

};

// The exported functions, which can be accessed in index.js.
module.exports = {
	getAllGenres: getAllGenres,
	getTopInGenre: getTopInGenre,
	getRecs: getRecs,
	getDecades: getDecades,
  bestGenresPerDecade: bestGenresPerDecade
}