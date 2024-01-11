express = require("express");
const app = express();
const mysql = require("mysql");
const flash = require('connect-flash');

// mysql database connection

const con = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "root",
    database: "nodejs",

});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    // SQL query to create the table if it doesn't exist
    var createTableSQL = `
      CREATE TABLE IF NOT EXISTS student (
      rollno INT NOT NULL PRIMARY KEY, 
      name VARCHAR(255),
      dob DATE,
      score INT 
      ) 
    `;
    
    con.query(createTableSQL, function (err, result) {
      if (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log("Table already exists");
        } else {
          throw err;  
        }
      } 
    });
  });
//middlewares

var connection = require('request');
const port = 4000
var bodyParser = require("body-parser")
var session = require("express-session")

app.use(session({
    secret: 'wrajkesarwani',
    resave: true,
    saveUninitialized: true
  }));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// view engine configuration
app.set("view engine", "ejs");
app.set("views", "./views")


app.use(express.static(__dirname + "/public"))

app.use((req, res, next) => {
    // Disable caching for all responses
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});
//middleware 
function requireSession(req, res, next) {

    if (req.session && req.session.user_id) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
//Routings

//Home Page routing

app.get("/", (req, res) => {
    res.render("index")

});

app.get("/logout", (req, res) => {
    console.log("Logout")
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        } else {
            res.render("index")
        }
    });
});



//teacher login page routing

app.get("/teacher/login", (req, res) => {
    res.render("teacher/teacherlogin", {
        message: "",
        timeout: ''// Define an appropriate timeout value in milliseconds
    });
});


//student login page routing

app.get("/student/login" , (req, res) => {
    res.render("student/studentlogin")

});  

//teacher login routing for diplaying next option page


app.post("/loginteacher",  function (request, response, next) {
    var emailid = request.body.emailid;
    var password = request.body.password;
    console.log(emailid+" "+password);
    if (emailid && password) {
        query = `SELECT * FROM teacher where emailid ="${emailid}" `;
        con.query(query, function (error, data) {
          
            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].password == password) {
                        request.session.user_id = data[count].emailid;

                        response.render("teacher/option");
                    }
                    else {
                        const timeout = 3000;
                        response.render('teacher/teacherlogin',{
                            message: "Wrong username or password!!",timeout
                        })
                    }
                }
            }
            else {
              //  response.locals.errorMessage="Please fill the entries..";
              response.render('teacher/teacherlogin',{
                errorMessage: "Please fill the datails!!",timeout
            })
            }
            response.end();
        });
    }
    else {
        response.redirect('/teacher/login');
        response.end();
    }

});

app.get("/option", requireSession , function (req, res) {
    res.render("teacher/option")
});
//routing to display add student page 

app.get("/teacher/add", requireSession ,function (req, res) {
   // res.render("teacher/addstudent")
    res.render("teacher/addstudent",{
        message:"",
        timeout:''  
    })
})

//routing to add student in database

app.post("/addstudent" ,(req, res) => {
    // errorMessage="";
    //fetching data from form
    const { rollno, name, dob, score } = req.body
    console.log("data...",req.body)
    let qry = `SELECT * FROM student WHERE rollno=?`;

    con.query(qry, [rollno], (err, results) => {
        if (err)
            throw err;
        else {
            if (results.length > 0) {
                console.log("Entered in exist..!!"+results+" "+req.body);
                const timeout = 3000;
                res.render('teacher/addstudent',{ 
                    message: "User Already Exists!!",timeout
                })
            } else {
                let qry2 = `INSERT INTO student values(?,?,?,?)`;
                const timeout = 3000;
                con.query(qry2, [rollno, name, dob, score], (err, results) => {
                    if(err) console.log("error "+err);
                    else{
                        res.render('teacher/addstudent',{ 
                            message: "Student Added Successfully!!",timeout
                        })
                    }
                   //  res.redirect("/teacher/add")
                })
            }

        }
    })

});

// routing for diplaying all student score

app.get('/teacher/viewall', requireSession , (req, res) => {
    console.log("ALLLLLLLLLLLLLLLLLLLL")
    let sql = "SELECT * FROM  student ORDER BY rollno";
    con.query(sql, (err, rows) => {
        if (err) throw err;

        res.render('teacher/viewall', {
            student: rows
        });
    });
});

app.get('/teacher/option', requireSession ,(req, res) => {
    res.render("teacher/option")
});

// routing for deleting the student


app.get('/teacher/delete/:userId', requireSession , (req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from student where rollno = ${userId}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/teacher/viewall');
    });
});

// routing to diplay student edit page
app.get('/teacher/edit/:userId', requireSession , (req, res) => {
    const userId = req.params.userId;
    let sql = `SELECT * FROM student where rollno = ${userId}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.render('teacher/edit', {
            student: result[0]
        });
    });
});


// routing to update student details after editing

app.post('/update', requireSession ,(req, res) => {
    const userId = req.body.rollno;
    let sql = "UPDATE  student SET  name='" + req.body.name + "', dob='" + req.body.dob + "'  ,  score='" + req.body.score + "' where rollno =" + userId;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.redirect('teacher/viewall');
    });
});

// routing for student login using dob and roll no

app.post("/login", function (request, response, next) {

    var rollno = request.body.rollno;
    var dob = request.body.dob;
    if (rollno && dob) {
        query = `SELECT * FROM student WHERE rollno ="${rollno}" AND dob ="${dob}"`;
        con.query(query, function (error, data) {
            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].rollno == rollno) {
                        request.session.user_id = data[count].name;

                        response.render("student/view", { student: data });
                    }
                    else {
                        response.redirect('/student/login')
                    }
                }
            }
            else {
                response.redirect('/student/login')
            }
            response.end();
        });
    }
    else {
        response.redirect('/student/login')
        response.end();
    }

});



//create server
app.listen(port, (err) => {
    if (err)
        throw err
    else
        console.log("Server is running at port %d:", port);
});