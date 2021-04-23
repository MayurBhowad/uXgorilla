const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

//Import Routes
const users = require('./routes/api/users');

const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport MiddleWare
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

//Use Routes
app.use('/', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Running on port: ${port}`));