$(document).ready(function () {
  $.get({
    url: 'http://localhost:5000/api/v1/posts',
    success: function (data) {
      const posts = data.posts
      for (const post of posts) {
        let postCard = $('<article class="post_card"></article>').data('id', post.id);
        let postTitle = $('<h2 class="post_title"></h2>').text(post.title);
        let postContent = $('<p class="post_content"></p>').text(post.content);

        let postUser = $('<div class="post_user"></div>');
        let postUserProfilePic = $('<img src="../static/images/user_profile_pic.png">')

        let postInfo = $('<div class="post_info"></div>')
        let postBy = $('<p class="posted_by"></p>').text(
          `${post.user.first_name} ${post.user.last_name}`
        )
        const formatedDate = formatDate(post.created_at)
        let postDate = $('<p class="post_date"></p>').text(formatedDate)

        postInfo.append(postBy, postDate)
        postUser.append(postUserProfilePic, postInfo)
        postCard.append(postTitle, postContent, postUser)
        $('.posts').append(postCard)
      }

    }
  }).fail(function (response) {
    console.log(response.responseJSON.messaeg)
  });


  $('.posts').on('click', '.post_card', function (event) {
    window.location = 'post.html?id=' + $(this).data('id')
  })

  $(window).scroll(function () {
    if ($(this).scrollTop() > 250) { // Adjust the scroll point as needed
      $('.write_button_group').addClass('fixed');
      $('.write_button_group .write_button').text('Write');

    } else {
      $('.write_button_group').removeClass('fixed');
      $('.write_button_group .write_button').text('Write your post');
    }
  })

  $('.write_button_group').click(function () {
    if (!Cookies.get('access_token')) {
      alert('You have to login to be able to write your own posts');
      window.location = 'login.html';
    } else {
      window.location = 'post.html?write=True;'
    }
  });
});

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
