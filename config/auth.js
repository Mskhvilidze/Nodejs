const passport = require('passport');
const { session } = require('passport');
const express = require('express');
const router = express.Router();
//Bring in Modell
let Article = require('../models/article');
//Passport Config
require('../config/passport')(passport);
//Passport Middelware
router.use(passport.initialize());
router.use(passport.session()); 
module.exports = { 
    secureAuthenticated: function(req,res,next) { 
    if(!req.session.passport || !req.session.passport.user){
    req.flash('info' , 'bitte einloggen, um diese Ressource anzuzeigen'); 
    res.redirect('/users/login'); 
    }else{
        return next();
    } 
    },

    validateArticle: function(req, res, next){
    Article.findById(req.params.id, function(err, article){
    if(article == null){
    req.flash('info' , 'bitte einloggen, um eine Article löschen zu dürfen!'); 
    res.redirect('/users/login'); 
    }else{
    return next();
    }   
    });    
    }
    };