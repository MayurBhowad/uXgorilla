const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('../config/keys');
const path = require('path')
const fs = require('fs')

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(path.join(__dirname, '../routes/api'));
        fs.readFile(`${__dirname}/../routes/api/data.json`, async function (err, data) {
            const users = JSON.parse(data);
            foundUser(users, jwt_payload).then(user => {
                if (user) {
                    return done(null, user)
                }
                return done(null, false, { message: 'Incorrect password.' })
            })
        })
    }));
}

function foundUser(json, thisUser) {
    return new Promise((resolve, reject) => {
        let user = []
        json.map((item, i) => {
            if (item.username === thisUser.username) {
                user.push(item);
            }
            if ((Object.keys(json).length) === i + 1) {
                if (user.length > 0) {
                    resolve(user[0])
                }
                if (user.length === 0) {
                    reject('username not found')
                }
            }
        })
    })
}