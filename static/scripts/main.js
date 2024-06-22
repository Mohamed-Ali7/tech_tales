$(document).ready(function () {
  let refreshTokenAccessed = false;
  let originalRequest = null;
  $.ajaxSetup({
    statusCode: {
      401: function (xhr) {
        const error = xhr.responseJSON;
        if (error && error.message === 'JWT token has expired' && !refreshTokenAccessed) {
          const refreshToken = Cookies.get('refresh_token');
          refreshTokenAccessed = true;

          if (!refreshToken) {
            window.location = 'login.html';
            return;
          }

          $.ajax({
            type: 'GET',
            url: 'http://localhost:5000/api/v1/auth/refresh',
            headers: {
              'Authorization': 'Bearer ' + refreshToken
            },
            success: function (data) {
              const newAccessToken = data.access_token;
              Cookies.set('access_token', newAccessToken, { 'expires': 10 });
              originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
              $.ajax(originalRequest);
            },
            error: function (response) {
              console.log(response.responseJSON.message);
              window.location = 'index.html';
            }
          });
        } else {
          window.location = 'login.html';
        }
      },
      403: function (xhr) {
        alert(xhr.responseJSON.message)
        return;
      }
    },
    beforeSend: function (xhr, settings) {
      const accessToken = Cookies.get('access_token');
      if (accessToken && !refreshTokenAccessed) {
        originalRequest = settings;
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      }
    }
  });
});
