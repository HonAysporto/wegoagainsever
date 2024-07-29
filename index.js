const express = require("express");  
const app = express();
const ejs = require('ejs')
app.set('view engine', 'ejs')
const port = 5000;
const bodyParser = require('body-parser');
const mongoose = require("mongoose")
const session = require('express-session');
const methodOverride = require('method-override');


app.use (express.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(methodOverride('_method'));
// const allStudents = [
//     {
//         firstname: "Awosika",
//         lastname: "Ayomide",
//         email:"ayomideoluwafemi2019@gmail.com",
//         password:"fish"
//     },
//     {
//         firstname: "Awosika",
//         lastname: "Ayomyinka",
//         email:"ayomideoluwafunto2019@gmail.com",
//         password:"meat"
//     }
// ]
const allNoisemakers = []
let URI = 'mongodb+srv://Honourable:Password@cluster0.guyvfqs.mongodb.net/school_portal_db?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(URI).then(()=> {
    console.log('mongodb connected successfully');
}).catch((err)=> {
    console.log('mongodb no gree connect')
    console.log(err);
})




let studentSchema = mongoose.Schema({
    firstname : {type:String, required:true},
    lastname :  {type:String, required:true},
    email : {type:String, required:true, unique:true},
    password: {type:String, required:true},
    registrationDate : {type:Date, default:Date.now()}
})

let studentModel = mongoose.model("student", studentSchema)





// app.get("/fish", (req, res)=> {
//     // res.send([
//     //     {Firstname : "Awosika"},
//     //     {Lastname : "Ayomide"}

//     // ])

//     // res.sendFile(__dirname + '/index.html')
//     res.render("fish")
// })

// app.get("/", (req, res)=> {
//     // res.send("Welcome to /");
//     res.render('index');
// })

app.get('/signin', (req,res)=> {
    res.render('signin')
})

app.get('/signup', (req,res)=> {
    res.render('signup')
})

app.get('/dashboard', (req, res) => {

    if (!req.session.user) {
        return res.redirect('/signin');
    }
    studentModel.find()
        .then(allStudents => {
            res.render('dashboard', {signedInUser: req.session.user, allStudents });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while fetching students.');
        });
});
app.get('/noisemaker', (req,res)=> {
    res.render('nisemaker', {allNoisemakers})
})

app.get("/noisedashboard", (req, res) => {
    res.render('noisedashboard');
})




app.post('/register', (req, res)=> {
console.log(req.body);
let form = new studentModel(req.body);
form.save().then(()=> {
    console.log('data saved');
    res.redirect("/dashboard")
}).catch((err) => {
    console.log("failed to save")
    console.log(err);
})

})


app.post('/noisemaker', (req, res)=> {
    console.log(req.body);
    allNoisemakers.push(req.body)
    res.redirect('/noisemaker')
    
})

app.post('/signinn', (req, res) => {
    const { email, password } = req.body;
    
    studentModel.findOne({ email })
        .then(user => {
            if (user) {
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                console.log();('User not found');
                res.redirect('/signup')
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred');
        });
});

app.delete('/delete-student/:id', (req, res) => {
    const studentId = req.params.id;

    studentModel.findByIdAndDelete(studentId)
        .then(() => {
            console.log('Student deleted successfully');
            res.redirect('/dashboard');  // Redirect to dashboard after deletion
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while deleting the student.');
        });
});


app.get('/edit-student/:id', (req, res) => {
    const studentId = req.params.id;

    studentModel.findById(studentId)
        .then(student => {
            if (student) {
                res.render('edit-student', { student }); // Render the edit form with student data
            } else {
                res.status(404).send('Student not found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while fetching student details.');
        });
});


app.post('/update-student', (req, res) => {
    const { studentId, firstname, lastname, email, registrationDate } = req.body;

    studentModel.findByIdAndUpdate(studentId, {
        firstname,
        lastname,
        email,
        registrationDate
    })
    .then(() => {
        console.log('Student updated successfully');
        res.redirect('/dashboard'); // Redirect to dashboard after update
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('An error occurred while updating the student.');
    });
});




app.listen(port, (err)=> {
    if (err) {
        console.log("App no gre start o");
    } else {
        console.log("App has started running at port " + port);
    }
})