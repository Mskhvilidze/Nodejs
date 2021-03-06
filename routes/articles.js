const express = require('express');
const router = express.Router();

//Bring in Article Modell
let Article = require('../models/article');

/**
  * pug seite
  */
 router.get('/add', (req, res) =>{
    res.render('add_article', {
    title: 'Add Article'
    })
});

//Add Submit Post Route
router.post('/add', function(req, res){
   req.checkBody('title', 'Title is required').notEmpty();
   req.checkBody('author', 'Author is required').notEmpty();
   req.checkBody('body', 'Body is required').notEmpty();

   //Get error
   let errors = req.validationErrors();

   if(errors){
       res.render('add_article', {
           title: 'Add Article',
           errors: errors
       });
   }else{
       let article = new Article();
       article.title = req.body.title;
       article.author = req.body.author;
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
router.get('/:id', function(req, res){
   Article.findById(req.params.id, function(err, article){
       res.render('article', {
           article: article
       })
   });
});

//Load Single Article
router.get('/edit/:id', function(req, res){
   
   Article.findById(req.params.id, function(err, article){
       res.render('edit_article', {
           title: "Edit Article",
           article: article
       });
   });
});

//Update Article 
router.post('/edit/:id', function(req, res){
   req.checkBody('title', 'Title is required').notEmpty();
   req.checkBody('author', 'Author is required').notEmpty();
   req.checkBody('body', 'Body is required').notEmpty();

   let article = {};
   article.title = req.body.title;
   article.author = req.body.author;
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
router.delete('/:id', function(req, res){
   let query = {_id: req.params.id};

   Article.deleteOne(query, function(err){
       if(err){
           console.log('Error bei Delete! ' + err);
       }
       req.flash('danger', 'Article deleted')
       res.send('Success');
   });
});

module.exports = router;