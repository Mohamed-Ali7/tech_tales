$(document).ready(function () {
  $.get({
    url: 'http://localhost:5000/api/v1/posts?per_page=2',
    success: function (data) {
      const posts = data.posts
      let postNum = 1;
      for (const post of posts) {
        const postElement = $(`#post_item_${postNum}`);

        postElement.find('.post_title').text(post.title);
        postElement.find('.post_content').text(post.content);
        postElement.find('a').attr('href', `post.html?id=${post.id}`);
        postNum++;
      }

    }
  }).fail(function (response) {
    console.log(response.responseJSON.messaeg)
  });


  $('.posts').on('click', '.post_card', function (event) {
    window.location = '/post?id=' + $(this).data('id')
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
      window.location = '/login';
    } else {
      window.location = '/post?write=True;'
    }
  });
});
