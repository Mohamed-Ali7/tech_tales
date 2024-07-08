$(document).ready(function () {

  $('.logo').click(function () {
    window.location = 'home.html';
  });

  $('header .home_button').click(function () {
    window.location = "home.html"
  })

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
  let passwordIsValid = true;
  let passwordConfirmIsValid = true;
  let firstNameIsValid = true;
  let lastNameiIsValid = true;

  function checkEmail() {
    clearErrors($('#sign_up_email'));
    if (!validateEmail($('#sign_up_email').val())) {
      showError($('#sign_up_email'), 'Please enter a valid email.');
      emailIsValid = false;
    } else {
      $('#sign_up_email').css('border-color', 'green')
      emailIsValid = true;
    }
  }

  function checkPassword() {
    clearErrors($('#sign_up_password'));
    if ($('#sign_up_password').val().trim().length < 8) {
      showError($('#sign_up_password'), 'Password must be at least 8 characters long.');
      passwordIsValid = false;
    } else {
      $('#sign_up_password').css('border-color', 'green')
      passwordIsValid = true;
    }
  }

  function checkConfirmPassword() {
    clearErrors($('#sign_up_password_confirm'));
    if ($('#sign_up_password').val().trim() !== $('#sign_up_password_confirm').val().trim()) {
      showError($('#sign_up_password_confirm'), 'Passwords do not match.');
      passwordConfirmIsValid = false;
    } else {
      $('#sign_up_password_confirm').css('border-color', 'green')
      passwordConfirmIsValid = true;
    }
  }

  function checkFirstName() {
    clearErrors($('#sign_up_user_first_name'));

    if ($('#sign_up_user_first_name').val().trim() === '') {
      showError($('#sign_up_user_first_name'), 'First name cannot be empty.');
      firstNameIsValid = false;
    } else {
      $('#sign_up_user_first_name').css('border-color', 'green')
      firstNameIsValid = true;
    }
  }

  function checkLastName() {
    clearErrors($('#sign_up_user_last_name'));

    if ($('#sign_up_user_last_name').val().trim() === '') {
      showError($('#sign_up_user_last_name'), 'Last name cannot be empty.');
      lastNameiIsValid = false;
    } else {
      $('#sign_up_user_last_name').css('border-color', 'green');
      lastNameiIsValid = true;
    }
  }

  $('#sign_up_email').focusout(function () {
    checkEmail()
  })

  $('#sign_up_password').focusout(function () {
    checkPassword()
  })

  $('#sign_up_password_confirm').focusout(function () {
    checkConfirmPassword()
  })

  $('#sign_up_user_first_name').focusout(function () {
    checkFirstName()
  })

  $('#sign_up_user_last_name').focusout(function () {
    checkLastName()
  })

  $('#sign_up_form').submit((event) => {
    event.preventDefault();

    checkEmail()
    checkPassword()
    checkConfirmPassword()
    checkFirstName()
    checkLastName()

    if (emailIsValid && passwordIsValid && passwordConfirmIsValid && firstNameIsValid
      && lastNameiIsValid
    ) {
      const email = $('#sign_up_email').val().trim();
      const password = $('#sign_up_password').val().trim();
      const confirmPassword = $('#sign_up_password_confirm').val().trim();
      const firstName = $('#sign_up_user_first_name').val().trim();
      const lastName = $('#sign_up_user_last_name').val().trim();

      const userData = {
        email: email,
        password: password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName
      }

      $.post({
        url: 'http://localhost:5000/api/v1/auth/register',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function (data) {
          sessionStorage.setItem('flush_message',
            '<strong>You have signed up successfully,</strong><br>'+
            'a verification link has sent to your email'
          )
          window.location = 'login.html'
        }
      }).fail(function (response) {
        if (response.responseJSON.message === 'This email address is already in use') {
          showError($('#sign_up_email'), response.responseJSON.message);
        }
        console.log(response.responseJSON)
      });
    }
  })
});
