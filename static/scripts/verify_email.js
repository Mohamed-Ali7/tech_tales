$(document).ready(function () {

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token')

  if (!token) {
    if (Cookies.get('access_token')) {
      window.location = 'home.html'
    }
    $('body').show()
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function showError(input, message) {
      const errorElement = $('<div class="error_message"></div>').text(message);
      input.addClass('error');
      input.closest('.input_group').after(errorElement);
    }

    function clearErrors(input) {
      input.closest('.input_group').next('.error_message').remove();
      input.removeClass('error');
    }

    clearErrors($('body'))

    let emailIsValid = true;

    function checkEmail() {
      clearErrors($('#verify_email'));
      if (!validateEmail($('#verify_email').val())) {
        showError($('#verify_email'), 'Please enter a valid email.');
        emailIsValid = false;
      } else {
        emailIsValid = true;
      }
    }

    $('#email_verification_form').submit((event) => {
      event.preventDefault();

      checkEmail()

      if (emailIsValid) {
        const email = $('#verify_email').val().trim();

        $.post({
          url: 'http://localhost:5000/api/v1/auth/email-verification',
          contentType: 'application/json',
          data: JSON.stringify({email: email}),
          success: function (data) {
            sessionStorage.setItem(
              'flush_message',
              'A verification link has sent to your email'
            )
            window.location = 'login.html';
          }
        }).fail(function (response) {
          let message;
          if (response.responseJSON) {
            message = response.responseJSON.message
          } else {
            message = 'Invalid email';
          }
          $('#verify_email').addClass('error');
          const errorElement = $('<div class="error_message error"></div>')
            .text(message)
          $('#verify_email').closest('.input_group').after(errorElement)
          console.log(response.responseJSON)
        });
      }
    })
    return;
  }

  $.get({
    url: `http://localhost:5000/api/v1/auth/email-verification/${token}`,
    success: function (data) {
      sessionStorage.setItem('flush_message', data.message);
      window.location = 'login.html';
    }
  }).fail(function (response) {
    if (response.responseJSON) {
      if (response.responseJSON.message === 'Email verifcation token is invalid or expired') {
        sessionStorage.setItem(
          'flush_error_message',
          'Invalid or expired verification link, ' +
          'click on (Send a verification mail) to send a new link'
        );
        window.location = 'login.html';
      } else {
        sessionStorage.setItem('flush_error_message', response.responseJSON.message);
        window.location = 'login.html';
      }
    } else {
      sessionStorage.setItem('flush_error_message', 'Something went wrong!');
      window.location = 'login.html';
    }
  });
});