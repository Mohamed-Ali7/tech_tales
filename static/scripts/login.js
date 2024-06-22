$(document).ready(function () {

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
  let passwordIsValid = true;

  function checkEmail() {
    clearErrors($('#login_email'));
    if (!validateEmail($('#login_email').val())) {
      showError($('#login_email'), 'Please enter a valid email.');
      emailIsValid = false;
    } else {
      emailIsValid = true;
    }
  }

  function checkPassword() {
    clearErrors($('#login_password'));
    if ($('#login_password').val().trim().length == 0) {
      showError($('#login_password'), 'Password is required.');
      passwordIsValid = false;
    } else {
      passwordIsValid = true;
    }
  }

  $('#login_form').submit((event) => {
    event.preventDefault();

    checkEmail()
    checkPassword()

    if (emailIsValid && passwordIsValid) {
      const email = $('#login_email').val().trim();
      const password = $('#login_password').val().trim();

      const userData = {
        email: email,
        password: password,
      }

      $.post({
        url: 'http://localhost:5000/api/v1/auth/login',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function (data) {
          Cookies.set('access_token', data.tokens.access_token, { 'expires': 10 })
          Cookies.set('refresh_token', data.tokens.refresh_token, { 'expires': 10 })
          window.location = 'index.html';
        }
      }).fail(function (response) {
        $('#login_email').addClass('error');
        $('#login_password').addClass('error');
        const errorElement = $('<div class="error_message error"></div>')
          .text('Invalid email or password')
        $('#login_password').closest('.input_group').after(errorElement)
        console.log(response.responseJSON)
      });
    }
  })
});
