$(document).ready(function () {

  const token = Cookies.get('access_token');
  let decodedJwtToken;
  let currentUserId;
  if (token) {
    decodedJwtToken = decodeJwt(token);
    currentUserId = decodedJwtToken.public_id;
  }

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

  function clearErrors(input) {
    input.removeClass('error');
    input.next('.error_message').remove()
  }

  function createCommentsElements(comment, postId) {
    const commentuserId = comment.public_user_id;
    const formatedCommentDate = formatDate(comment.created_at);

    const commentElement = $('<div class="comment"></div>');
    const commentHeadElement = $('<div class="comment_head"></div>');

    const commentButtonsElement = $('<div class="comment_buttons"></div>')
    const editCommentButton = $('<button class="edit_comment_button">Edit</button>');
    const deleteCommentButton = $('<button class="delete_comment_button">Delete</button>');

    const commentUserElement = $('<div class="comment_user"></div>');
    const userProfPicElement = $('<img src="../static/images/user_profile_pic.png">');
    const userNameElement = $(
      `<a href="user_profile.html?id=${commentuserId}" class="user_name"></a>`
    ).text(comment.user_name);

    const commentDateElement = $('<span class="comment_date"></span>');
    commentDateElement.text(formatedCommentDate);

    const commentContentElement = $('<p class="comment_content"></p>');
    const formattedContent = comment.content.replace(/\n/g, '<br>');

    commentContentElement.html(formattedContent);
    commentUserElement.append(
      userProfPicElement,
      userNameElement,
      commentDateElement
    );
    commentHeadElement.append(commentUserElement);

    if (comment.public_user_id == currentUserId) {
      commentButtonsElement.append(editCommentButton, deleteCommentButton)
      commentHeadElement.append(commentButtonsElement);
    }

    commentElement.append(commentHeadElement, commentContentElement);
    commentElement.attr('data-id', comment.id);
    commentElement.attr('data-post-id', postId);

    return commentElement;
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

  function updateComment(commentId, commentCurrentContent, postId) {
    const formattedContent = commentCurrentContent.replace(/<br>/g, '\n');
    $('.popup_comment_content').val(formattedContent)
    $('#edit_comment_popup').show()
    $('.popup_save_comment_button').off('click').on('click', function () {
      const newCommentContent = $('.popup_comment_content').val()
      $.ajax({
        type: 'PUT',
        url: `http://localhost:5000/api/v1/posts/${postId}/comments/${commentId}`,
        contentType: 'application/json',
        data: JSON.stringify({ content: newCommentContent }),
        success: function (data) {
          const commentElement = $(`.comment[data-id="${commentId}"]`);
          const formattedContent = data.content.replace(/\n/g, '<br>');
          commentElement.find('.comment_content').html(formattedContent);
          $('#edit_comment_popup').hide();
        }
      }).fail(function (response) {
        console.error(response.responseJSON.message);
      })
    });
  }
  function loadPost(postId) {
    $.get({
      url: `http://localhost:5000/api/v1/posts/${postId}`,
      success: function (post) {
        const postUserName = `${post.user.first_name} ${post.user.last_name}`
        const postUserId = post.user.public_id
        const userLinkElement = `<a href="user_profile.html?id=${postUserId}">${postUserName}</a>`
        $('.post_title').text(post.title)
        $('.post_info .posted_by').html(`Posted by ${userLinkElement}</a>`)
        const formatedDate = formatDate(post.created_at)

        $('.post_info .post_date').text('at ' + formatedDate)

        const formattedContent = post.content.replace(/\n/g, '<br>');

        $('.post_content').html(formattedContent)

        $.get({
          url: `http://localhost:5000/api/v1/posts/${postId}/comments`,
          success: function (data) {
            const commentElements = []
            const comments = data.comments;
            for (const comment of comments) {
              commentElements.push(createCommentsElements(comment));
            }
            $('.post_comments').append(commentElements);

            const addCommentGroupElement = $('.add_comment_group');
            const loginLink = '<a href="login.html">Login</a>';
            const addCommentLoginNotif = $(
              `<p>You have to ${loginLink} to be able to leave comments for different posts</p>`
            );

            const commentTextArea = $('<textarea id="comment_area"></textarea>');
            const addCommentButton = $('<button class="add_comment_button">Add comment</button>');

            if (Cookies.get('access_token')) {
              addCommentGroupElement.append(commentTextArea, addCommentButton);
            } else {
              addCommentGroupElement.append(addCommentLoginNotif);
            }

            $('.add_comment_button').click(function () {
              commentContent = $('#comment_area').val().trim();
              if (commentContent) {
                $.post({
                  url: `http://localhost:5000/api/v1/posts/${postId}/comments`,
                  contentType: 'application/json',
                  data: JSON.stringify({ content: commentContent }),
                  success: function (data) {
                    $('#comment_area').val('')
                    $('.post_comments').append(createCommentsElements(data, postId))
                  }
                }).fail(function (response) {
                  console.error(response.responseJSON.message);
                });
              }
            });
          }
        }).fail(function (response) {
          console.error(response.responseJSON.message)
        });
        if (currentUserId == post.user.public_id) {
          const editPostButtonElement = $('<button class="edit_post_button">Edit</button>');
          const deletePostButtonElement = $('<button class="delete_post_button">Delete</button>');
          $('.post_buttons').append(editPostButtonElement, deletePostButtonElement);
          $('.edit_post_button').click(function () {
            window.location = `post.html?id=${postId}&edit=True`
          });

          $('.delete_post_button').click(function () {
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
                window.location = 'home.html';
              }
            }).fail(function (response) {
              console.error(response.responseJSON.message)
            });
          });
        }

        $('.post_comments').on('click', '.comment .edit_comment_button', function () {
          const commentElement = $(this).closest('.comment');
          const commentId = commentElement.data('id');
          commentCurrentContent = commentElement.find('.comment_content').html();
          updateComment(commentId, commentCurrentContent, postId);

          $('.comment_popup_close_button').click(function () {
            $('#edit_comment_popup').hide();
          });
        });

        $('.post_comments').on('click', '.comment .delete_comment_button', function () {
          const commentElement = $(this).closest('.comment');
          const commentId = commentElement.data('id');
          const confirmation = confirm(
            'Are you sure you want to delete this comment? This action cannot be undone.'
          );
          if (!confirmation) {
            return;
          }
          $.ajax({
            type: 'DELETE',
            url: `http://localhost:5000/api/v1/posts/${postId}/comments/${commentId}`,
            success: function (data) {
              console.log(data.message)
              commentElement.remove();
            }
          }).fail(function (response) {
            console.error(response.responseJSON.message)
          });
        });
      }
    }).fail(function (response) {
      console.error(response.responseJSON.message)
    });
  }

  function creatFormElement(status) {

    const formElement = $('<form id="post_form"></form>');
    const formTitleElement = $('<h1 class="form_title"></h1>').text(status);
    const postTitleGroup = $('<div class="post_title_group"></div>');
    const postTitleInput = $(
      '<input type="text" id="post_title" name="title" placeholder="Title">'
    );

    const postContentGroup = $('<div class="post_content_group"></div>');
    const postContentTextArea = $(
      '<textarea id="post_content" placeholder="Write your post..." rows="10"></textarea>'
    );

    const buttonGroupElement = $('<div class="button_group"></div>');
    const saveButtonElement = ('<button type="submit" class="btn btn-primary">Save</button>');
    const cancelButtonElement = $(
      '<button type="button" id="cancelButton" class="btn btn-secondary">Cancel</button>'
    );

    buttonGroupElement.append(saveButtonElement, cancelButtonElement);
    postTitleGroup.append(postTitleInput);
    postContentGroup.append(postContentTextArea)
    formElement.append(
      formTitleElement, postTitleGroup,
      postContentGroup, buttonGroupElement
    );
    $('main').append(formElement);
  }

  function loadEditForm(postId) {

    $.get({
      url: `http://localhost:5000/api/v1/posts/${postId}`,
      success: function (post) {

        if (post.user.public_id != currentUserId) {
          console.error('You are not authorized to edit this post');
          window.location = `post.html?id=${postId}`;
          return;
        }

        $('.post_details').remove();
        creatFormElement('Edit Post');
        $('#post_title').val(post.title);
        $('#post_content').val(post.content);

        $('.btn-secondary').click(function () {
          window.location = `post.html?id=${postId}`
        })

        $('#post_form').submit(function (event) {
          event.preventDefault();
          clearErrors($('#post_title'));
          clearErrors($('#post_content'));
          const postTitle = $('#post_title').val().trim();
          const postContent = $('#post_content').val().trim();

          let postTitleIsValid = true;
          let postContentIsValid = true;

          if (postTitle.length > 250 || !postTitle) {
            let message = ''
            if (postTitle) {
              message = 'Post title cannot be longer than 250 characters';
            } else {
              message = 'Post title cannot be empty';
            }
            showError($('#post_title'), message);
            postTitleIsValid = false;
          } else {
            clearErrors($('#post_title'));
            postTitleIsValid = true;
          }

          if (!postContent) {
            showError($('#post_content'), 'Post content cannot be empty');
            postContentIsValid = false;
          } else {
            postContentIsValid = true;
            clearErrors($('#post_content'));
          }

          if (!postTitleIsValid || !postContentIsValid) {
            return;
          }

          const updatedPost = {
            title: $('#post_title').val().trim(),
            content: $('#post_content').val().trim()
          };

          $.ajax({
            type: 'PUT',
            url: `http://localhost:5000/api/v1/posts/${postId}`,
            contentType: 'application/json',
            data: JSON.stringify(updatedPost),
            success: function (data) {
              window.location = `post.html?id=${postId}`
            },
            error: function (response) {
              console.error(response.responseJSON.message);
            }
          });
        });
      },
      error: function (response) {
        console.error(response.responseJSON.message);
      }
    });

  }

  function loadCreateForm() {
    $('.post_details').remove();
    creatFormElement('Create Post');

    $('#post_form').submit(function (event) {
      event.preventDefault();
      clearErrors($('#post_title'));
      clearErrors($('#post_content'));
      const postTitle = $('#post_title').val().trim();
      const postContent = $('#post_content').val().trim();

      let postTitleIsValid = true;
      let postContentIsValid = true;

      if (postTitle.length > 250 || !postTitle) {
        let message = ''
        if (postTitle) {
          message = 'Post title cannot be longer than 250 characters';
        } else {
          message = 'Post title cannot be empty';
        }
        showError($('#post_title'), message);
        postTitleIsValid = false;
      } else {
        clearErrors($('#post_title'));
        postTitleIsValid = true;
      }

      if (!postContent) {
        showError($('#post_content'), 'Post content cannot be empty');
        postContentIsValid = false;
      } else {
        postContentIsValid = true;
        clearErrors($('#post_content'));
      }

      if (!postTitleIsValid || !postContentIsValid) {
        return;
      }
      const newPost = {
        title: postTitle,
        content: $('#post_content').val().trim()
      };

      $.post({
        url: 'http://localhost:5000/api/v1/posts',
        contentType: 'application/json',
        data: JSON.stringify(newPost),
        success: function (data) {
          window.location = `post.html?id=${data.id}`;
        },
        error: function (response) {
          console.error(response.responseJSON.message);
        }
      });
    });
    $('.btn-secondary').click(function () {
      window.location = `home.html`
    })
  }

  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit')) {
    const postId = urlParams.get('id');
    if (postId) {
      loadEditForm(postId);
    } else {
      window.location = 'home.html';
    }
  } else if (urlParams.get('write')) {
    if (!Cookies.get('access_token')) {
      alert('You have to login to be able to write your own posts');
      window.location = 'home.html';
      return;
    }
    loadCreateForm();
  } else {
    const postId = urlParams.get('id');
    if (postId) {
      loadPost(postId);
    } else {
      window.location = 'home.html';
    }
  }
});
