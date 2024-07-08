$(document).ready(function () {

  const urlParams = new URLSearchParams(window.location.search);
  const passwordResetToken = urlParams.get('token');
  if (!passwordResetToken) {
    sessionStorage.setItem(
      'flush_error_message',
      'Invalid password reset link,<br>' +
      'Click on (forgot my password) to send a new password reset link'
    );
    window.location = 'login.html';
    return;
  }
  function showError(input, message) {
    const errorElement = $('<div class="error_message"></div>').text(message);
    input.addClass('error');
    input.css('border-color', 'red')
    input.closest('.input_group').after(errorElement);
  }

  function clearErrors(input) {
    input.closest('.input_group').next('.error_message').remove();
    input.removeClass('error');
  }

  clearErrors($('body'))

  let newPasswordIsValid = true;
  let newPasswordConfirmIsValid = true;

  function checkPassword() {
    clearErrors($('#new_password'));
    if ($('#new_password').val().trim().length < 8) {
      showError($('#new_password'), 'Password must be at least 8 characters long.');
      newPasswordIsValid = false;
    } else {
      $('#new_password').css('border-color', 'green')
      newPasswordIsValid = true;
    }
  }

  function checkConfirmPassword() {
    clearErrors($('#password_confirm'));
    if ($('#new_password').val().trim() !== $('#password_confirm').val().trim()) {
      showError($('#password_confirm'), 'Passwords do not match.');
      newPasswordConfirmIsValid = false;
    } else {
      $('#password_confirm').css('border-color', 'green')
      newPasswordConfirmIsValid = true;
    }
  }

  $('#new_password').focusout(function () {
    checkPassword()
  })

  $('#password_confirm').focusout(function () {
    checkConfirmPassword()
  })

  $('#password_reset_form').submit((event) => {
    event.preventDefault();

    checkPassword()
    checkConfirmPassword()

    if (newPasswordIsValid && newPasswordConfirmIsValid) {
      const password = $('#new_password').val().trim();
      const confirmPassword = $('#password_confirm').val().trim();

      const userData = {
        new_password: password,
        confirm_new_password: confirmPassword,
        password_reset_token: passwordResetToken
      }

      $.post({
        url: 'http://localhost:5000/api/v1/users/password-reset',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function (data) {
          sessionStorage.setItem('flush_message',
            'Your password has been successfully reset'
          )
          window.location = 'login.html'
        }
      }).fail(function (response) {
        if (response.responseJSON) {
          sessionStorage.setItem('flush_error_message',
            'Invalid or expired password reset link, ' +
            'click on (Forgot my password) to send a new link'
          );
          window.location = 'login.html';
        } else {
          console.error('Something went wrong!')
        }
      });
    }
  })
});
