const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../config/auth');

//Bring in Article Modell
let User = require('../models/user');
const { session } = require('passport');

router.get('/register', function(req, res){
    if(req.session.passport){
    res.render('register', {
        user: req.session.passport.user
    });
}else{
    res.render('register');
}
});

//Register Process
router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password1 = req.body.password1;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'E-Mail is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password1', 'Confirmpassword is required').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors: errors
        })
    }else{
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            password1: password1
        });

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(erro, hash){
               if(erro){
                   console.log('Error by Hash: ' + erro);
               }
                newUser.password = hash;
                newUser.save(function(error){
                    if(error){
                        console.log("Error by Register: " + error);
                        return;
                    } else{
                        req.flash('success', 'You are now registered and can log in');
                        res.redirect('/users/login');
                    }
                })
            });
        })
    }
});

//Passport Config
require('../config/passport')(passport);
//Passport Middelware
router.use(passport.initialize());
router.use(passport.session()); 

//Login Form
router.get('/login', function(req, res, next){
    res.render('login');
});

//Login Process
router.post('/login',  function(req, res, next){
    passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true })(req, res, next);
    req.flash('success', 'Eingeloggt ist ' + req.body.username);
});

//Logout
router.get('/logout', function(req, res){
    if(req.isAuthenticated()){
        req.logout();
        req.flash('success', 'Du bist ausgeloggg');
        res.redirect('/users/login');
    }
});

module.exports = router;