
# TechTales

Welcome to **TechTales**, your go-to platform for the latest technology news, insightful articles, and engaging discussions. Whether you're a tech enthusiast or a professional, TechTales offers a space to share and expand your knowledge.

## Introduction

TechTales was inspired by the need for a comprehensive platform that caters to the diverse interests of the tech community. We aim to provide a space where users can discover, engage, and learn from the latest in technology.

- **Deployed Site:** [TechTales](http://techtales.alxairbnb.tech/)
- **Final Project Blog Article:** [TechTales Blog](https://medium.com/@mohammed.ali17955/techtales-a-comprehensive-blogging-platform-a863ea7570ad)
- **Authors:**
	 - Mohamed Ali [LinkedIn](https://www.linkedin.com/in/mohamed-ali7/) | [GitHub](https://github.com/Mohamed-Ali7)
	 - Olusegun Tayo [LinkedIn](https://www.linkedin.com/in/oluseguntayo) | [GitHub](https://github.com/OluTshegz)

## Installation

To run TechTales locally, follow these steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/Mohamed-Ali7/tech_tales.git
   cd tech_tales` 

2.  **Set up the virtual environment: (Optional)**

    ```
    python3 -m venv venv
    source venv/bin/activate
    ``` 

3.  **Install dependencies using the provided requirements file:**

    ```
    pip install -r requirements.txt
    ``` 
    
3.  **Set up the database:**
    
    -   Use the provided SQL file `setup_mysql_dev.sql` to set up your MySQL database and user.

4.  **Configure the email service:**
    
    - Open `api/v1/__init__.py` and locate the following lines:
		```
		app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
		app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
		```

	- Replace these lines with your own email and application-specific password. If you are using Gmail, you may need to generate an app password. Search for instructions on how to create an app password for Gmail.

    -   Alternatively, you can configure the application to use a different email server by updating the following line: 
		 ```
		 app.config['MAIL_SERVER'] = 'smtp.gmail.com' 
		 ```
	 - Ensure that the necessary email configurations (server, port, TLS/SSL settings) are set according to your email provider's specifications.
        
5.  **Run the Flask application:**
    
    To start the Flask application, navigate to the project's main directory and execute the following command:

    **`python3 -m api.v1.app`**
    
	This will launch the application, making it accessible for testing and development purposes. Ensure that the necessary dependencies are installed and the database is configured correctly before running the application.


## Usage

1.  Ensure you run the web pages on `localhost:5500` (as provided by Live Server in Visual Studio Code) to match the test environment with the code written.
    
2.  Once the application is running, you can access it in your web browser at `http://localhost:5500/templates/index.html`.
    

### Main Browser Routes

-   **Landing Page:**
		`http://localhost:5500/templates/index.html`
		
-   **Login Page:**
		`http://localhost:5500/templates/login.html`

-   **Sign Up Page:**
		`http://localhost:5500/templates/sign_up.html`

-   **Home Page:**
		`http://localhost:5500/templates/home.html`

-   **Specific Post Page:**
		`http://localhost:5500/templates/post.html?id=(post_id)`

-   **Specific User Profile:**
		`http://localhost:5500/templates/user_profile.html?id=(user_id)`


## API Endpoints

### Authentication Endpoints

- **Register:** `/api/v1/auth/register`
	- **Description:** Registers a new user and sends an email verification.
	- **Method:** POST
	- **Protection:** Non-Protected

- **Login:** `/api/v1/auth/login`
	- **Description:** Authenticates user credentials, verifies email, and provides JWT tokens.
	- **Method:** POST 
	- **Protection:** Non-Protected
	
- **Refresh:** `/api/v1/auth/refresh`
	- **Description:** Refreshes the user's access token when it has expired.
	- **Method:** POST
	- **Protection:** Non-Protected

- **Logout:** `/api/v1/auth/logout`
	- **Description:** Logs the user out.
	- **Method:** DELETE
	- **Protection:** Protected
	
- **Email Verification:** `/api/v1/auth/email-verification/<token>`
	- **Description:** Verifies the user's email address.
	- **Method:** GET 
	- **Protection:** Non-Protected

- **Resend Verification Email:** `/api/v1/auth/email-verification`
	- **Description:** Sends a new email verification to the user's registered email address.
	- **Method:** POST
	- **Protection:** Non-Protected

### User Endpoints
- **Get All Users:** `/api/v1/users`
	- **Description:** Retrieves a list of all registered users. Accessible only by admin users.
	- **Method:** GET
	- **Protection:** Protected (Admin Only)

- **Get Specific User:** `/api/v1/users/<id>`
	- **Description:** Retrieves information about a specific user.
	- **Method:** GET
	- **Protection:** Non-Protected

- **Update Specific User:** `/api/v1/users/<id>`
	- **Description:** Updates the user's information. Users can only update their own data.
	- **Method:** PUT
	- **Protection:** Protected

- **Delete Specific User:** `/api/v1/users/<id>`
	- **Description:** Deletes a user account. Users can only delete their own account.
	- **Method:** DELETE
	- **Protection:** Protected

- **Get User's Posts:** `/api/v1/users/<id>/posts`
	- **Description:** Retrieves all posts created by a specific user.
	- **Method:** GET 
	- **Protection:** Non-Protected

### Post Endpoints

- **Create Post:** `/api/v1/posts` 
	- **Description:** Creates a new post. Only authenticated users can create posts
	- **Method:** POST
	- **Protection:** Protected

- **Get All Posts:** `/api/v1/posts`
	- **Description:** Retrieves a list of all posts.
	- **Method:** GET
	- **Protection:** Non-Protected

- **Get Specific Post:** `/api/v1/posts/<id>`
	- **Description:** Retrieves details of a specific post.
	- **Method:** GET
	- **Protection:** Non-Protected

- **Update Specific Post:** `/api/v1/posts/<id>`
	- **Description:** Updates a specific post. Only the post author can update the post.
	- **Method:** PUT
	- **Protection:** Protected

- **Delete Specific Post:** `/api/v1/posts/<id>`
	- **Description:** Deletes a specific post. Only the post author can delete the post. 
	- **Method:** DELETE
	- **Protection:** Protected

### Comment Endpoints
- **Create Comment:** `/api/v1/posts/<post_id>/comments`
	- **Description:** Creates a new comment for a specific post. Only authenticated users can create comments.
	- **Method:** POST
	- **Protection:** Protected

- **Get All Comments:** `/api/v1/posts/<post_id>/comments`
	- **Description:** Retrieves all comments for a specific post.
	- **Method:** GET
	- **Protection:** Non-Protected 

- **Get Specific Comment:** `/api/v1/posts/<post_id>/comments/<comment_id>`
	- **Description:** Retrieves details of a specific comment on a specific post.
	- **Method:** GET
	- **Protection:** Non-Protected 

- **Update Specific Comment:** `/api/v1/posts/<post_id>/comments/<comment_id>`
	- **Description:** Updates a specific comment. Only the comment author can update the comment.
	- **Method:** PUT
	- **Protection:** Protected 

- **Delete Specific Comment:** `/api/v1/posts/<post_id>/comments/<comment_id>`
	- **Description:** Deletes a specific comment. Only the comment author can delete the comment.
	- **Method:** DELETE
	- **Protection:** Protected

## Contributing

We welcome contributions from the community! To contribute to TechTales:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-branch`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push -u origin feature-branch`).
5.  Create a new Pull Request.

## Related Projects

Here are some related projects that might interest you:

-   [Blog REST APIs With Spring Boot](https://github.com/Mohamed-Ali9937/Blog-REST-API-With-Spring-Boot) - A project that implements RESTful APIs for a blog web application using the Spring Boot Java framework. This project provides a comprehensive backend solution for managing blog posts, comments, and user authentication, similar to the APIs in TechTales.


## License

This project is not licensed.