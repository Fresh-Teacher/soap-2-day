document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.querySelector("body").classList.add("loaded");
    }, 10)
});


$(document).ready(function () {
    const iframe = $('#videoIframe');
    const loadingVideo = $('#loadingVideo');

    iframe.on('load', function () {
        loadingVideo.hide();
    });

    iframe.on('beforeunload', function (event) {
        loadingVideo.show();
        event.preventDefault();
        event.stopPropagation();
    });

    iframe.open = function () {
    };

    $(".player-button").click(function () {
        $(this).siblings().removeClass("btn-success").addClass("btn-primary");
        $(this).siblings().find("#currentPlayer").remove();
        $(this).removeClass("btn-primary").addClass("btn-success");
        if ($(this).find("#currentPlayer").length === 0) {
            $(this).prepend('<i id="currentPlayer" class="fas fa-play"></i>');
        }
    });

    const refreshIcon = document.getElementById('refreshCaptcha');

    if (refreshIcon) {
        refreshIcon.addEventListener('click', function () {
            refreshIcon.classList.add('fa-spin');
            fetch('/app/http/captcha')
                .then(function (response) {
                    document.getElementById('captchaImage').src = '/app/http/captcha.php';
                    setTimeout(function () {
                        refreshIcon.classList.remove('fa-spin');
                    }, 950);
                })
                .catch(function (error) {
                    console.log('Error refreshing captcha:', error);
                    refreshIcon.classList.remove('fa-spin');
                });
        });
    }
});

$(function () {
    if ($.fn.Lazy) {
        $('.lazy').Lazy({
            effect: 'fadeIn',
            placeholder: '/assets/img/loader.gif',
            onError: function (element) {
                console.log('Error loading ' + element.data('src'));
                element.attr('src', '/assets/img/not-found.png');
            }
        });
    }
});

function retrieveMovieEmbed(movieId, server) {
    $('#loadingVideo').show();

    $.ajax({
        url: "/app/http/public/retrieveMovieEmbed.php",
        method: "GET",
        dataType: 'json',
        data: {"movie_id": movieId, "server": server},
        success: function (response) {
            if (!response.error) {
                const iframe = $('#videoIframe');
                iframe.attr("src", response.embed);

                iframe.on('load', function () {
                    $('#loadingVideo').hide();
                });
                return
            }
            alert(response.message)
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    });
}

function retrieveEpisodeEmbed(episodeId, server) {
    $('#loadingVideo').show();

    $.ajax({
        url: "/app/http/public/retrieveEpisodeEmbed",
        method: "GET",
        dataType: 'json',
        data: {"episode_id": episodeId, "server": server},
        success: function (response) {
            if (!response.error) {
                const iframe = $('#videoIframe');
                iframe.attr("src", response.embed);

                iframe.on('load', function () {
                    $('#loadingVideo').hide();
                });
                return
            }
            alert(response.message)
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    });
}

let currentLocation = location.href, navLinks = document.querySelectorAll(".navbar-nav a"),
    linkLength = navLinks.length, i = 0;
for (; i < linkLength; i++) navLinks[i].href === currentLocation && (navLinks[i].className = "nav-link active");

let per = 0;
$(document).ready(function () {
    $("#turnoff").css("height", $(document).height()).hide();
    $(document).click(function (e) {
        if (!$(e.target).hasClass('switch-turn-off') && per === 1) {
            $("#turnoff").toggle();
            per = 0;
        }
    });
    $(".switch-turn-off").click(function () {
        $("#turnoff").toggle();
        per += 1;
        if (per === 2) {
            per = 0;
        }
    });
});

function getEpisodes(seriesId, season, slug) {
    $("#selectSeason").text("Season " + season);
    const episodeDiv = $("#episodeList");
    episodeDiv.empty();
    episodeDiv.append('<div class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</div>');
    $.ajax({
        url: "/app/http/public/getEpisodes",
        method: "GET",
        dataType: 'json',
        data: {"series_id": seriesId, "season": season},
        success: function (response) {
            if (!response.error) {
                let i;
                const data = response.data;
                const episodeDiv = $("#episodeList");
                episodeDiv.empty();
                for (i = 0; i < data.length; i++) {
                    episodeDiv.append('<a class="btn btn-info btn-sm me-2 mb-2" role="button" href="/series/' + slug + '/' + data[i].season + '/' + data[i].episode + '">Episode ' + data[i].episode + ': ' + data[i].title + '</a>');
                }
                return
            }
            alert(response.message)
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    });
}

function submitForm(event) {
    event.preventDefault();
    const searchInput = document.getElementById("searchInput");
    const searchValue = searchInput.value.trim();
    if (searchValue !== "") {
        window.location.href = "/search/" + encodeURIComponent(searchValue);
    }
}

$('#reportForm').submit(function (event) {
    event.preventDefault();

    Swal.fire({
        title: 'Reporting the video',
        text: 'Please wait...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    });

    $.ajax({
        url: '/app/http/public/report-video',
        type: 'POST',
        dataType: 'json',
        data: $(this).serialize(),
        success: function (response) {
            grecaptcha.reset();
            if (response["error"]) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response["message"],
                })
                return;
            }
            $('#reportModal').modal('hide');
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response["message"],
            })
            $("#reportForm")[0].reset();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    });
});

$('#addRequestVideo').submit(function (event) {
    event.preventDefault();

    Swal.fire({
        title: 'Video request',
        text: 'Please wait...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    });

    $.ajax({
        url: '/app/http/public/request-video',
        type: 'POST',
        dataType: 'json',
        data: $(this).serialize(),
        success: function (response) {
            grecaptcha.reset();
            if (response["error"]) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response["message"],
                })
                return;
            }
            $('#requestVideoModal').modal('hide');
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response["message"],
            })
            $("#addRequestVideo")[0].reset();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    });
});

const textarea = document.getElementById('reportMessage');
const charCount = document.getElementById('charCount');

const maxLength = 250;

if (textarea !== null) {
    textarea.addEventListener('input', function () {
        const text = textarea.value;
        const remainingChars = maxLength - text.length;

        charCount.textContent = Math.max(0, remainingChars);

        if (text.length > maxLength) {
            textarea.value = text.slice(0, maxLength);
        }
    });
}