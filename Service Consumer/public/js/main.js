$(function () {
    /* Suggest New Movie */

    var formSN = $('#region-select');
    var formMessage = $('#form-message');

    $(formSN).submit(function (event) {
        event.preventDefault();
        var region = $('#region').val();

        $.ajax({
            type: 'GET',
            url: 'http://netflix.dev:3001/movie?r=' + region,
            success: function (data) {
                var movie = data;
                $('div#poster > img').attr('src', movie.poster);
                $('div.title-text > h3').text(movie.title);
                $('div.title-text > ul').empty();
                $('div.title-text > ul').append("<li>" + movie.year + "</li>");
                $('div.title-text > ul').append("<li>" + movie.runtime + "</li>");
                $('div.title-text > ul').append("<li>" + movie.genre + "</li>");
                $('div.title-text > ul').append("<li>Language: " + movie.language + "</li>");
                $('section#plot > p').text(movie.plot);
                $('p#rating').text(movie.imdb_rating);
                $('section#imdb a').attr('href', 'http://www.imdb.com/title/' + movie.imdb_id);
                $('div#flags').empty();
                $('div#flags').append('<p></p>');
                if (movie.regions.length < 10) {
                    $.each(movie.regions, function (index, region) {
                        $('div#flags > p').append('<span class="label label-secondary"><span class="flag-icon flag-icon-' + region + '"></span> ' + region.toUpperCase() + '</span>');
                    });
                } else {
                    for (var i = 0; i < 9; i++) {
                        var region = movie.regions.pop();
                        $('div#flags > p').append('<span class="label label-secondary"><span class="flag-icon flag-icon-' + region + '"></span> ' + region.toUpperCase() + '</span>');
                    }
                    $('div#flags').append('<p></p>');
                    $.each(movie.regions, function (index, region) {
                        $('div#flags > p:nth-of-type(2)').append('<span class="label label-secondary"><span class="flag-icon flag-icon-' + region + '"></span> ' + region.toUpperCase() + '</span>');
                    });
                }
            }
        });
    });

});
