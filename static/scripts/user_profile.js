$(document).ready(function () {
  let postsAreCalled = false;

  function decodeJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  function showError(input, message) {
    const errorElement = $('<p class="error_message"></p>').text(message);
    input.addClass('error');
    input.after(errorElement);
  }

  function clearErrors(input, inputClosest) {
    input.removeClass('error');
    input.next('.error_message').remove()
  }

  function formatDate(dateStr) {

    // Parse the date string into a Date object
    let dateObj = new Date(dateStr);

    // Define the array of month names
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Extract the month, day, and year from the Date object
    let month = monthNames[dateObj.getMonth()];
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();

    // Format the date string as "June 24, 2024"
    return `${month} ${day}, ${year}`;
  }

  function updateUser(currentUser) {
    clearErrors($('.edit_first_name'));
    clearErrors($('.edit_last_name'));
    let firstNameIsValid = true;
    let lastNameIsValid = true;

    $('.edit_first_name').val($('.user_first_name span').text())
    $('.edit_last_name').val($('.user_last_name span').text())
    $('#edit_user_popup').show()
    $('.popup_save_user_button').off('click').on('click', function () {
      clearErrors($('.edit_first_name'))
      clearErrors($('.edit_last_name'));

      const newFirstNameElement = $('.edit_first_name');
      const newLastNameElement = $('.edit_last_name');
      if (!newFirstNameElement.val()) {
        showError(newFirstNameElement, 'This field cannot be empty')
        firstNameIsValid = false
      } else {
        firstNameIsValid = true
      }
      if (!newLastNameElement.val()) {
        showError(newLastNameElement, 'This field cannot be empty')
        lastNameIsValid = false;
      } else {
        lastNameIsValid = true
      }
      if (!firstNameIsValid || !lastNameIsValid) {
        return;
      }
      const newUserContent = {
        first_name: newFirstNameElement.val(),
        last_name: newLastNameElement.val()
      }
      $.ajax({
        type: 'PUT',
        url: `http://localhost:5000/api/v1/users/${currentUser.public_id}`,
        contentType: 'application/json',
        data: JSON.stringify(newUserContent),
        success: function (data) {
          $('.user_first_name span').text(newUserContent.first_name);
          $('.user_last_name span').text(newUserContent.last_name);
          $('.user_info .user_name').text(
            `${newUserContent.first_name} ${newUserContent.last_name}`
          )
          $('#edit_user_popup').hide();
        }
      }).fail(function (response) {
        console.error(response.responseJSON.message);
      })
    });
  }

  function aboutUser(currentUserId, user) {
    $('.user_about_button').addClass('clicked')
    $('.user_first_name span').text(user.first_name);
    $('.user_last_name span').text(user.last_name);
    $('.user_email span').text(user.email);
    const formatedData = formatDate(user.joined_at)
    $('.user_joined_at span').text(formatedData);
  }

  function createChangePasswordPopup() {
    const changePasswordPopupElement = $('<div id="change_password_popup"></div>');
    const changePasswordPopupContentElement = $(
      '<div class="change_password_popup_content"></div>'
    );
    const oldPasswordInputGroupElement = $(
      '<div class="old_password_input_group"></div>'
    );

    const oldPasswordInputElement = $(
      '<input class="old_password_input" type="password" placeholder="Old password">'
    )
    const newPasswordInputGroupElement = $(
      '<div class="new_password_input_group"></div>'
    );

    const newPasswordInputElement = $(
      '<input class="new_password_input" type="password" placeholder="New password">'
    );

    const confirmNewPasswordInputGroupElement = $(
      '<div class="confirm_new_password_input_group"></div>'
    );

    const confirmNewPasswordInputElement = $(
      '<input class="confirm_new_password_input" type="password" placeholder="Confirm new password">'
    );

    const popupFooterElement = $('<div class="popup_footer"></div>');
    const popSaveButton = $('<button class="popup_save_password_button">Save</button>');
    const popCancelButton = $(
      '<button class="change_password_popup_close_button">Cancel</button>'
    );

    oldPasswordInputGroupElement.append(oldPasswordInputElement);
    newPasswordInputGroupElement.append(newPasswordInputElement);
    confirmNewPasswordInputGroupElement.append(confirmNewPasswordInputElement);

    changePasswordPopupContentElement.append(
      oldPasswordInputGroupElement,
      newPasswordInputGroupElement,
      confirmNewPasswordInputGroupElement
    );

    popupFooterElement.append(popSaveButton, popCancelButton);

    changePasswordPopupElement.append(changePasswordPopupContentElement, popupFooterElement);
    $('.user_box').append(changePasswordPopupElement);
  }

  function changePassword(user) {

    clearErrors($('.old_password_input'));
    clearErrors($('.new_password_input'));
    clearErrors($('.confirm_new_password_input'));
    $('#change_password_popup').show()
    let oldPasswordIsValid = true;
    let newPasswordIsValid = true;
    let confirmNewPasswordIsValid = true;

    $('.popup_save_password_button').off('click').on('click', function () {
      clearErrors($('.old_password_input'));
      clearErrors($('.new_password_input'));
      clearErrors($('.confirm_new_password_input'));

      const oldPasswordElement = $('.old_password_input');
      const newPasswordElement = $('.new_password_input');
      const confirmNewPasswordElement = $('.confirm_new_password_input');
      if (!oldPasswordElement.val().trim()) {
        showError(oldPasswordElement, 'Please enter your current password')
        oldPasswordIsValid = false
      } else {
        oldPasswordIsValid = true
      }
      if (newPasswordElement.val().trim().length < 8) {
        showError(newPasswordElement, 'Password must be at least 8 characters long.')
        newPasswordIsValid = false;
      } else {
        newPasswordIsValid = true
      }
      if (confirmNewPasswordElement.val().trim() != newPasswordElement.val().trim()) {
        showError(confirmNewPasswordElement, 'Passwords do not match.')
        confirmNewPasswordIsValid = false;
      } else {
        confirmNewPasswordIsValid = true
      }
      if (!oldPasswordIsValid || !newPasswordIsValid || !confirmNewPasswordIsValid) {
        return;
      }
      const newPasswordData = {
        old_password: oldPasswordElement.val(),
        new_password: newPasswordElement.val(),
        confirm_new_password: confirmNewPasswordElement.val()
      }
      $.ajax({
        type: 'PUT',
        url: `http://localhost:5000/api/v1/users/${user.public_id}/edit/password`,
        contentType: 'application/json',
        data: JSON.stringify(newPasswordData),
        success: function (data) {
          $('#change_password_popup').hide();
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          const userLoginData = {
            email: user.email,
            password: newPasswordElement.val().trim()
          }
          $.post({
            url: 'http://localhost:5000/api/v1/auth/login',
            contentType: 'application/json',
            data: JSON.stringify(userLoginData),
            success: function (data) {
              Cookies.set('access_token', data.tokens.access_token, { 'expires': 10 })
              Cookies.set('refresh_token', data.tokens.refresh_token, { 'expires': 10 })
            }
          }).fail(function (response) {
            if (response.responseJSON) {
              console.log(response.responseJSON.message)
            } else {
              console.error(
                'An error occurred while sending the request, please make sure that the requested URL has no issues'
              );
            }
          });
        }
      }).fail(function (response) {
        if (response.responseJSON) {
          if (response.responseJSON.message === 'Incorrect password') {
            showError($('.old_password_input'), response.responseJSON.message);
          } else {
            console.error(response.responseJSON.message)
          }
        } else {
          console.error(
            'An error occurred while sending the request, please make sure that the requested URL has no issues'
          );
        }
      })
    });
  }

  function createPostElement(post, user, currentUserId) {
    const postDetailsElement = $('<article class="post_details"></article>');
    const postTopElement = $('<div class="post_top"></div>');
    const postHeaderElement = $('<div class="post_header"></div>');
    const postTitleElement = $('<p class="post_title"></p>').text(post.title);
    const postButtonsElement = $('<div class="post_buttons"></div>');
    const viewPostButtonElement = $('<button class="view_post_button">View</button>');
    const editPostButtonElement = $('<button class="edit_post_button">Edit</button>');
    const deletePostButtonElement = $(
      '<button class="delete_post_button">Delete</button></div>'
    );
    const formatedDate = formatDate(post.created_at);
    const postDateElement = $(
      '<span class="post_date"></span>').text(`Posted at ${formatedDate}`
      );
    const postContentElement = $('<div class="post_content"></div>').text(post.content);

    postButtonsElement.append(viewPostButtonElement);

    if (user.public_id == currentUserId) {
      postButtonsElement.append(editPostButtonElement, deletePostButtonElement);
    }
    postHeaderElement.append(postTitleElement, postButtonsElement);
    postTopElement.append(postHeaderElement, postDateElement);
    postDetailsElement.append(postTopElement, postContentElement);
    postDetailsElement.attr('data-id', post.id);
    return postDetailsElement;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id')
  const token = Cookies.get('access_token');
  let decodedJwtToken;
  let currentUserId;
  let userIsAdmin;

  if (token) {
    decodedJwtToken = decodeJwt(token);
    currentUserId = decodedJwtToken.public_id;
    userIsAdmin = decodedJwtToken.admin;
  }
  if (!userId && !userIsAdmin) {
    window.location = 'home.html';
  }

  if (userId) {
    $('.user_about_info').css('display', 'flex')

    $.get({
      url: `http://localhost:5000/api/v1/users/${userId}`,
      success: function (user) {
        $('.user_info .user_name').text(
          `${user.first_name} ${user.last_name}`
        )

        aboutUser(currentUserId, user);

        if (currentUserId == user.public_id) {
          const editProfileButtonElement = $(
            '<button class="edit_profile_button">Edit profile</button>'
          );
          const changePasswordButtonElement = $(
            '<button class="change_password_button">Change password</button>'
          );
          const deleteUserButtonElement = $(
            '<button class="delete_user_button">Delete my account</button>'
          );

          const editUserButtonsElement = $('<div class="edit_user_buttons"></div>');
          editUserButtonsElement.append(editProfileButtonElement, changePasswordButtonElement);
          $('.user_box .user_bar').append(editUserButtonsElement);
          $('.user_about_info').append(deleteUserButtonElement);

          createChangePasswordPopup();
        } else if (userIsAdmin) {
          const deleteUserButtonElement = $(
            '<button class="delete_user_button">Delete user</button>'
          );
          $('.user_about_info').append(deleteUserButtonElement);
        }

        $('.user_bar').on('click', '.edit_profile_button', function (event) {
          updateUser(user);
          $('.user_popup_close_button').click(function () {
            $('#edit_user_popup').hide();
          });
        });

        $('.user_bar').on('click', '.change_password_button', function (event) {
          changePassword(user);
          $('.change_password_popup_close_button').click(function () {
            $('#change_password_popup').hide();
          });
        });

        $('.delete_user_button').click(function () {
          const confirmation = confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
          );
          if (!confirmation) {
            return;
          }
          $.ajax({
            type: 'DELETE',
            url: `http://localhost:5000/api/v1/users/${userId}`,
            success: function (data) {
              Cookies.remove('access_token');
              Cookies.remove('refresh_token');
              window.location = 'home.html';
              console.log(data.message)
            }
          }).fail(function (response) {
            if (response.responseJSON) {
              console.error(response.responseJSON.message);
            } else {
              console.error(
                'An error occurred while sending the request, please make sure that the requested URL has no issues'
              );
            }
          });
        });

        $('.user_bar').on('click', '.edit_profile_button', function (event) {
          updateUser(user);
          $('.user_popup_close_button').click(function () {
            $('#edit_user_popup').hide();
          });
        });

        $('.user_about_button').click(function () {
          $('.user_posts_button').removeClass('clicked');
          $(this).addClass('clicked');
          aboutUser(currentUserId, user);
          $('.user_posts').hide();
          $('.user_about_info').show();
        });

        $('.user_posts_button').click(function () {
          $('.user_about_button').removeClass('clicked');
          $(this).addClass('clicked');
          $('.user_about_info').hide()
          $('.user_posts').css('display', 'flex');
          if (postsAreCalled) {
            return;
          }
          $.get({
            url: `http://localhost:5000/api/v1/users/${user.public_id}/posts`,
            success: function (data) {
              postsAreCalled = true;
              const posts = data.posts
              for (const post of posts) {
                $('.user_posts').append(createPostElement(post, user, currentUserId));
              }

              $('.edit_post_button').click(function () {
                const postId = $(this).closest('.post_details').data('id');
                window.location = `post.html?id=${postId}&edit=True`
              });

              $('.delete_post_button').click(function () {
                const postElement = $(this).closest('.post_details')
                const postId = postElement.data('id');
                const confirmation = confirm(
                  'Are you sure you want to delete this post? This action cannot be undone.'
                );
                if (!confirmation) {
                  return;
                }
                $.ajax({
                  type: 'DELETE',
                  url: `http://localhost:5000/api/v1/posts/${postId}`,
                  success: function (data) {
                    console.log(data.message)
                    window.location.reload()
                  }
                }).fail(function (response) {
                  console.error(response.responseJSON.message)
                });
              });
            }
          }).fail(function (response) {
            console.log(response.responseJSON.messaeg)
          });
        })
      }
    }).fail(function (response) {
      if (response.responseJSON) {
        console.error(response.responseJSON.message);
      } else {
        console.error(
          'An error occurred while sending the request, please make sure that the requested URL has no issues'
        );
      }
    });

    $('.user_posts').on('click', '.view_post_button', function () {
      const clickedPostId = $(this).closest('.post_details').data('id');
      window.location = `post.html?id=${clickedPostId}`
    });

  }
});
