$(function () {
	var movie;
    /* Persist region select in Local Storage & load previous selection */

    var selectedRegion = localStorage.getItem('selectedRegion') || 'us';
    $('select[name=region]').val(selectedRegion);
    $('select[name=region]').change(function () {
        localStorage.setItem('selectedRegion', $(this).val());
    });

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
                movie = data;
                showMovie(movie);
            }
        });
    });

    function showMovie(movie) {
        $('div#poster > img').fadeOut(300, function () {
            //$(this).attr('src', movie.poster).bind('onreadystatechange load', function () {
            //    if (this.complete) $(this).fadeIn(300);
            //});
            $(this).attr('src', movie.poster).load(function () {
                $(this).fadeIn(300);
            });
        });

        $('div.title-text').fadeOut(300, function () {
            $('div.title-text > ul').empty();
            $('div.title-text > h3').text(movie.title);
            $('div.title-text > ul').append("<li>" + movie.year + "</li>");
            $('div.title-text > ul').append("<li>" + movie.runtime + "</li>");
            $('div.title-text > ul').append("<li>" + movie.genre + "</li>");
            $('div.title-text > ul').append("<li>Language: " + movie.language + "</li>");
            $(this).fadeIn(300);
        });

        $('div.movie-info').fadeOut(300, function () {
            $('div#flags').empty();
            $('section#plot > p').text(movie.plot);
            $('p#rating').text(movie.imdb_rating);
            $('section#imdb a').attr('href', 'http://www.imdb.com/title/' + movie.imdb_id);
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
            $(this).fadeIn(300);
        });
    }

    /* Signin/Signup Modals */

    var formModal = $('.cd-user-modal'),
		formLogin = formModal.find('#cd-login'),
		formSignup = formModal.find('#cd-signup'),
		formForgotPassword = formModal.find('#cd-reset-password'),
		formModalTab = $('.cd-switcher'),
		tabLogin = formModalTab.children('li').eq(0).children('a'),
		tabSignup = formModalTab.children('li').eq(1).children('a'),
		forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
		backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a'),
		mainNav = $('.main-nav'),
        linkLogin = $('.cd-signin'),
        linkSignup = $('.cd-signup');

	//open sign-up form
	linkSignup.on('click', signup_selected);
	//open login-form form
	linkLogin.on('click', login_selected);

	//close modal
	formModal.on('click', function (event) {
		if ($(event.target).is(formModal) || $(event.target).is('.cd-close-form')) {
			formModal.removeClass('is-visible');
		}
	});
	//close modal when clicking the esc keyboard button
	$(document).keyup(function (event) {
		if (event.which == '27') {
			formModal.removeClass('is-visible');
		}
    });

	//switch from a tab to another
	formModalTab.on('click', function (event) {
		event.preventDefault();
		($(event.target).is(tabLogin)) ? login_selected() : signup_selected();
	});

	function login_selected() {
		mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.addClass('is-selected');
		formSignup.removeClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.addClass('selected');
		tabSignup.removeClass('selected');
	}

	function signup_selected() {
		mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.removeClass('is-selected');
		formSignup.addClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.removeClass('selected');
		tabSignup.addClass('selected');
	}

	formLogin.find('input[type="submit"]').on('click', function (event) {
		event.preventDefault();
		var formData = {
			email: formLogin.find('input[name=login-email]').val(),
			password: formLogin.find('input[name=login-password]').val()
		}
		$.ajax({
            type: 'POST',
            url: 'http://netflix.dev:3001/login',
			data: formData,
            success: function (data) {
				if (data.state = 'success') {
					formModal.removeClass('is-visible');
					login(data.user);
				}
            }
        });
	});
	formSignup.find('input[type="submit"]').on('click', function (event) {
		event.preventDefault();
		var formData = {
			username: formSignup.find('input[name=signup-username]').val(),
			email: formSignup.find('input[name=signup-email]').val(),
			password: formSignup.find('input[name=signup-password]').val()
		}
		$.ajax({
            type: 'POST',
            url: 'http://netflix.dev:3001/signup',
			data: formData,
            success: function (data) {
				if (data.state = 'success') {
					formModal.removeClass('is-visible');
					login(data.user);
				}
            }
        });
	});

	/* Suggest New Movie */

	function login(user) {
		var userSection = $('section#user');
		userSection.find('button').remove();
		userSection.find('p').remove();
		var watched_message = "<p>Mark this movie as watched and it won't be recommended to you again.</p>";
		var watched_check = '<form id="watched-check"><input type="checkbox" name="watched" value="watched">Watched <br /></form>';
		var logout_message = '<p class="text-secondary">Logged in as ' + user.name + '. <a href="/logout">Logout</a>.</p>';
		userSection.prepend(watched_message);
		userSection.prepend(watched_check);
		userSection.prepend(logout_message);

		$('#watched').on('click', function () {
			if ($(this).is(':checked')) {
				$.ajax({
					type: "POST",
					url: 'http://netflix.dev:3001/watchlist',
					data: { id: movie.imdb_id },
					success: function (data) {
						alert('it worked');
					}
				});
			}
		})

	}


});
