const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
    let errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if (Validator.isEmpty(data.username)) {
        errors = "Please provide username and password"
        return {
            errors,
            isValid: false
        };
    }

    if (Validator.isEmpty(data.password)) {
        errors = "Please provide username and password"
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