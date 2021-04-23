const Validator = require('validator');
const isEmpty = require('./is-empty');
var passwordValidator = require('password-validator');

var schema = new passwordValidator();

schema
    .is().min(5)                                    // Minimum length 8
    .has().uppercase(1)                              // Must have uppercase letters
    .has().lowercase(1)                              // Must have lowercase letters
    .has().digits(1)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .has().not().symbols()                           // Should not have ssymbols
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = function validateRegisterInput(data) {
    let errors = {};

    data.fname = !isEmpty(data.fname) ? data.fname : '';
    data.lname = !isEmpty(data.lname) ? data.lname : '';
    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (data.fname === '' || data.lname === '' || data.username === '' || data.password === '') {
        errors = "fields can\'t be empty"
        return {
            errors,
            isValid: false
        };
    }


    if (!Validator.isAlpha(data.fname)) {
        errors = "fname or lname check failed"
        return {
            errors,
            isValid: false
        };
    }

    if (!Validator.isAlpha(data.lname)) {
        errors = "fname or lname check failed"
        return {
            errors,
            isValid: false
        };
    }

    if (data.username !== '') {
        if (!Validator.isLowercase(data.username)) {
            errors = "username check failed"
            return {
                errors,
                isValid: false
            };
        }

        if (!Validator.isAlpha(data.username)) {
            errors = "username check failed"
            return {
                errors,
                isValid: false
            };
        }

        if (!Validator.isLength(data.username, { min: 4 })) {
            errors = "username check failed"
            return {
                errors,
                isValid: false
            };
        }
    }

    if (!schema.validate(data.password)) {
        errors = "password check failed"
        return {
            errors,
            isValid: false
        };
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};