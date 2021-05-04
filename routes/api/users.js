const express = require('express');
const fs = require('fs')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

//Load Input Validation
const validateRegisterInput = require('../../Validation/register');
const validateLoginInput = require('../../Validation/login');

const keys = require('../../config/keys');

//@route    GET api/users/tests
//@dest     Test users route
//@access   Public
router.get('/tests', (req, res) => res.json({ msg: "users WOrks" }));

//@route    POST api/users/register
//@dest     Register user
//@access   Public
router.post('/signup', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    let result = false

    //Check Validation
    if (!isValid) {
        return res.status(400).json({
            result: result,
            error: errors
        });
    }

    const newUser = {
        username: req.body.username,
        lname: req.body.lname,
        fname: req.body.fname,
        password: req.body.password,
    }

    //generate hashed Password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            //Reading and writing data from json db file
            fs.readFile(`${__dirname}/data.json`, async function (err, data) {
                if (err) {
                    console.log('creating json file');
                    let strNewUser = JSON.stringify(newUser)
                    //if jsonDB not found!
                    createJsonFile(strNewUser).then((resss) => {
                        res.status(200).json({
                            result: true,
                            message: "SignUp success. Please proceed to Signin"
                        })
                    }).catch(err => res.json({ message: 'creating file & adding data faild!' }))
                } else {
                    //if jsonDB found!
                    console.log("json file found");
                    writeToJson(data, newUser).then(ress => {
                        res.status(200).json({
                            result: true,
                            message: ress
                        })
                    })
                        .catch(err => res.status(400).json({
                            result: false,
                            error: err
                        }))
                }
            })
        });
    });
});

//@route    POST api/users/login
//@dest     Login User / Returning JWT 
//@access   Public
router.post('/signin', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //Check Validdation
    if (!isValid) {
        return res.status(400).json({
            result: false,
            error: errors
        });
    }

    //Read data from jsonDB
    fs.readFile(`${__dirname}/data.json`, async function (err, data) {
        let json = JSON.parse(data);
        findUserForLogin(json, req.body).then(user => {
            bcrypt.compare(req.body.password, user.password).then(isMatch => {
                if (isMatch) {
                    const payload = { username: user.username, firstname: user.firstname }

                    //jwt token
                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        { expiresIn: 3600 },
                        (err, token) => {
                            res.json({
                                result: true,
                                jwt: `${token}`,
                                message: 'Signin success'
                            })
                        }
                    )
                } else {
                    res.status(401).json({
                        result: false,
                        error: "Invalid username/password"
                    })
                }
            })
        })
            .catch(err => res.status(401).json({
                result: false,
                error: err
            }))
    })

    function findUserForLogin(json, loginCred) {
        return new Promise((resolve, reject) => {
            let username = [];
            json.map((user, i) => {
                if (!user) {
                    reject('Invalid username/password');
                }
                if (user.username === loginCred.username) {
                    username.push(user)
                }
                if ((Object.keys(json).length) === i + 1) {
                    if (username.length > 0) {
                        resolve(username[0])
                    }
                    if (username.length === 0) {
                        reject('Invalid username/password')
                    }
                }

            })
        })
    }
});


//@route    GET api/users/me
//@dest     get user details
//@access   Private
router.get('/user/me', (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.status(401).json({
            result: false,
            error: "Please provide a JWT token"
        })
    }

    //get user info from jwt token
    passport.authenticate('jwt', function (err, user, info) {
        if (err) { return res.json({ err: err }) }
        if (!user) {
            return res.status(401).json({
                result: false,
                error: "JWT Verification Failed"
            })
        }
        return res.status(200).json({
            result: true,
            data: {
                fname: user.fname,
                lname: user.lname,
                password: user.password
            }
        })
    })(req, res, next)
})



module.exports = router;


function createJsonFile(newuser) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${__dirname}/data.json`, `[${newuser}]`, (err) => {
            resolve();
        })
    })
}

function writeToJson(data, newUser) {
    return new Promise((resolve, reject) => {
        let json;
        json = JSON.parse(data)
        findUser(json, newUser).then((msg) => {
            json.push(newUser);
            fs.writeFile(`${__dirname}/data.json`, JSON.stringify(json), function (err) {
                if (err) { reject(err) };
                return resolve("SignUp success. Please proceed to Signin");
            });
        }).catch(err => reject(err))
    })
}

function findUser(json, newUser) {
    return new Promise((resolve, reject) => {
        let user = []
        json.map((item, i) => {
            if (item.username === newUser.username) {
                user.push(item.username);
            }
            if ((Object.keys(json).length) === i + 1) {
                if (user.length > 0) {
                    reject('username already exists')
                }
                if (user.length === 0) {
                    resolve('username not found')
                }
            }
        })
    })
}


