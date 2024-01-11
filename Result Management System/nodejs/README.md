# Result-Management-Application
A Result Management System using HTML, CSS, JavaScript , Node and using MVC Model.
• Two types of users can login to application by clicking a button on homepage.
• Students can enter their roll number and date of birth to view their result.
• Teachers can View all records, add new record, edit and delete the records.

# Setup Guide 

## Database 
1. Sign up or log in to MySQL to set up your database.
2. Create necessary tables according to your application's requirements.
3. Update your MySQL connection details in the app.js file.
  
## Backend 
1. Open the project in Visual Studio Code.
2. Go to toolbar --> terminal --> Open new terminal.
3. Run "npm install" and "npm install -g nodemon" .
4. Now to run the project --> Run "npm start" on terminal.

## Frontend
1. Open URL "https://localhost:4000" on a browser.

## Authentication
1. User Role Selection: When a user accesses the application, they are presented with two buttons to choose their role: "Student" or "Teacher".
2.Login Form Submission:After selecting their role, users are redirected to the respective login page (e.g., student-login.ejs or teacher-login.ejs).
Users enter their credentials (e.g., roll number and date of birth for students, username and password for teachers) and submit the login form.
3.Session Creation: Upon successful login, a session is created and stored on the server. This session contains essential user information and roles.
4.Session Verification:Whenever a user accesses a restricted page or performs actions requiring authentication, the server checks the user's session.
If a valid session exists, the user is allowed to proceed. If not, they are redirected to the login page.
Session Destruction (Logout):When a user logs out, the session is destroyed on the server, logging the user out and preventing unauthorized access.