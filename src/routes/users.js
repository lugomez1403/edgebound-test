const express = require('express');
const router = express.Router();

const User = require('../models/User');
const passport = require('passport');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local',{
    successRedirect: '/orders',
    failureRedirect: '/users/signin',
    failureFlash: true
}))

router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { user, password, conf_password} = req.body;
    const errors = [];
    if(user.length <= 0){
        errors.push({ text : 'The user cant not be blank, please insert the user'});
    }
    if(password.length <= 0){
        errors.push({ text : 'The password cant not be blank, please insert a password'});
    }
    if(conf_password.length <= 0){
        errors.push({ text :'The confirmation of password cant not be blank, please confirm password'});
    }
    if(password.length < 4) {
        errors.push({ text : 'The password is small, password must be at least 4 characters'});
    }
    if (password != conf_password) {
        errors.push({ text : 'Passwords do not match'});
    }
    if(errors.length > 0) {
        res.render("users/signup", {
            errors, 
            user, 
            password, 
            conf_password
        });
    }else{
        const EmailUser = await User.findOne({user: user});
        if (EmailUser) {
            req.flash('error_msg', 'The user is already in use');
            res.redirect('/users/signup');
        }
        const newUser = new User({user, password});
        newUser.password = await newUser.encyptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'You are registred');
        res.redirect('/users/signin');
    }
    
});

router.get('/users/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;