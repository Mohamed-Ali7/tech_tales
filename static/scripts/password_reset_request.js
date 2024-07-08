$(document).ready(function () {

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

  let emailIsValid = true;

  function checkEmail() {
    clearErrors($('#password_reset_request_email'));
    if (!validateEmail($('#password_reset_request_email').val())) {
      showError($('#password_reset_request_email'), 'Please enter a valid email.');
      emailIsValid = false;
    } else {
      $('#password_reset_request_email').css('border-color', 'green')
      emailIsValid = true;
    }
  }

  $('#password_reset_request_email').focusout(function () {
    checkEmail()
  })

  $('#password_reset_request_form').submit((event) => {
    event.preventDefault();

    checkEmail()

    if (emailIsValid) {
      const email = $('#password_reset_request_email').val().trim();

      const userData =

        $.post({
          url: 'http://localhost:5000/api/v1/users/password-reset-request',
          contentType: 'application/json',
          data: JSON.stringify({ email: email }),
          success: function (data) {
            sessionStorage.setItem('flush_message',
              'Password reset link has sent successfully'
            )
            window.location = 'login.html'
          }
        }).fail(function (response) {
          if (response.responseJSON) {
            showError($('#password_reset_request_email'), response.responseJSON.message);
          } else {
            console.error('Somthing went wrong!')
          }
        });
    }
  })
});
