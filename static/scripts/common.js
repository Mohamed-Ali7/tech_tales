$(document).ready(function () {

  const token = Cookies.get('access_token');
  let decodedJwtToken;
  let currentUserId;
  if (token) {
    decodedJwtToken = decodeJwt(token);
    currentUserId = decodedJwtToken.public_id;
    userIsAdmin = decodedJwtToken.admin;
  }

  function decodeJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }

  if (Cookies.get('access_token')) {
    let headerLogoutElement = $('<button class="logout_button">Log out</button>')
    const headerUserProfilePic = $('<div class="nav_profile_pic"></div>')

    $('.header_nav').append(headerUserProfilePic, headerLogoutElement)
  } else {
    let headerLogoinElement = $('<button class="login_button">Log in</button>')

    const headerSignupElement = $('<button class="signup_button">Sign Up</button>')

    $('.header_nav').append(headerLogoinElement, headerSignupElement)
  }

  const headerHomeElement = $('<button class="home_button">Home</button>')
  $('.header_nav').append(headerHomeElement)

  $('header .login_button').click(function () {
    window.location = "login.html"
  })

  $('header .signup_button').click(function () {
    window.location = "sign_up.html"
  })

  $('header .home_button').click(function () {
    window.location = "home.html"
  })

  $('header .logout_button').click(function () {
    const tokens = {
      access_toekn: Cookies.get('access_token'),
      refresh_toekn: Cookies.get('refresh_toekn')
    }
    data = { tokens: tokens }
    $.post({
      url: 'http://localhost:5000/api/v1/auth/logout',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (data) {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location = 'login.html';
      }
    }).fail(function (response) {
      if (response.responseJSON) {
        console.error(response.responseJSON.messaeg);
      } else {
        console.error(
          'An error occurred while sending the request, please make sure that the requested URL has no issues'
        );
      }

    });
  });

  $('.nav_profile_pic').click(function () {
    window.location = `user_profile.html?id=${currentUserId}`
  });

  $('.logo').click(function () {
    window.location = 'home.html';
  });
});
