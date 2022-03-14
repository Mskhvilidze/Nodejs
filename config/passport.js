const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    //Local Strategy
    passport.use(new localStrategy(function(username, password, done){
    // Mutch Username
    let query = {username:username};
    User.findOne(query, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'No user found'});
        }

    //Mutch password
    bcrypt.compare(password, user.password, function(erro, isMatch){
        if(erro) throw erro;
        if(isMatch){
            return done(null, user);
        }else{
            return done(null, false, {message: 'Wrong Password'});
        }
    });
    });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}