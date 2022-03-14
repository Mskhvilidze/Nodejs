const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session'); 
const config = require('./config/database');
const ensureAthenticated = require('./config/auth');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

//Verbindung mit der Mongoose
var mongoose = require('mongoose');
var uri = config.database;
var options = {
 useNewUrlParser: true, 
 useUnifiedTopology: true, 
}

mongoose.connect(uri, options, function(){

    console.log('successfull..');

});

//Midellware
// Anwendung erstellen / x-www-form-urlencoded Parser 
//Ohne diese Middelware werden keine Json-Dateien ausgegeben, sowie in der Datenbank nicht eingefügt werden
app.use(express.json()); 
app.use(express.urlencoded({extended: false}));

//Middelware für Session
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true
  }));

  //Middellware für Express Messages
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });

 //Midellware für Express Validator
 app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    },
     customValidators: {
      isPsd1EqPsd2: function(psd1,psd2) {
          console.log(psd1===psd2);
          return psd1===psd2;
      }
   }
  }));

//Bring in Modell
let Article = require('./models/article');
//User
let User = require('./models/user');

let users = require('./routes/users');
const { application } = require("express");
app.use('/users', users);


/**
 * Response auf pug Seite
 */
 app.get("/", function(req, res){
     
    Article.find({}, function(error, articles){
     if(error){
         console.log("Error! " + error);
     }else{
    
        if(req.session.passport == null){
        res.render('index', {
        title: 'Articles',
        articles: articles
        });

        }else{
        res.render('index', {
        title: 'Articles',
        articles: articles,
        user: req.session.passport.user
        });
     }
     }
     });
 });
 
 /**
  * pug seite
  */
 app.get('/article/add', ensureAthenticated.secureAuthenticated, (req, res) =>{
     if(req.session.passport == null){
        res.render('add_article', {
            title: 'Add Article' 
     });

     }else {
        res.render('add_article', {
            title: 'Add Article',
            user: req.session.passport.user
     });
    }
 });

//Add Submit Post Route
app.post('/article/add', function(req, res){
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    //Get error
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors,
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.session.passport.user;
        article.body = req.body.body;
        article.save(function(err){
        if(err){
           console.log("Error by save! " + err);
           return;
        }else{
            req.flash('success', 'Article Add');
            res.redirect('/');
            console.log("Saved");
        }
        });
    }
});

//Get Single Article
app.get('/article/:id', ensureAthenticated.validateArticle, function(req, res){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            if(req.session.passport == null){
                res.render('article', {
                article: article,
                author: user.name
            });
            
            }else{
            res.render('article', {
                article: article,
                author: user.name,
                user: req.session.passport.user
            });    
            }
        });
        });
});

//Load Single Article
app.get('/article/edit/:id', function(req, res){
    
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
        if(req.session.passport == null){
        res.render('edit_article', {
            title: "Edit Article",
            article: article
        });    
        }else {
        res.render('edit_article', {
            title: "Edit Article",
            article: article,
            user: req.session.passport.user
        });
    }
});
    });
});

//Update Article 
app.post('/article/edit/:id', function(req, res){
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let article = {};
    article.title = req.body.title;
    article.author = req.session.passport.user;
    article.body = req.body.body;

    let query = {_id: req.params.id}
    Article.updateOne(query, article, function(err){
    if(err){
        console.log('Error beim Aktualisieren! ' + err);
        return;
    }else{
        req.flash('success', 'Article Updated');
        res.send('Der Articles wurd  mit dem Namen ');
        }
    });
});

//Delete Article
app.delete('/article/:id', function(req, res){
    let query = {_id: req.params.id};

    Article.findById(req.params.id, function(err, article){
    Article.deleteOne(query, function(err){
    if(err){
            console.log('Error bei Delete! ' + err);
    }
    req.flash('danger', 'Article deleted')
    res.send('Success');
    });
});
});

/**
 * Port 
 */
app.listen(3000, function(){
    console.log("Server started on port 3000...")
});