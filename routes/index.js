var express = require('express');
var router = express.Router();
var fs = require('fs');
var jimp = require('jimp');
var oxford = require('project-oxford');
var GIFEncoder = require('GIFEncoder');
var pngFileStream = require('png-file-stream');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/',(req,res,next) => {
  var imgSrc = req.file? req.file.path : '';
  Promise.resolve(imgSrc)
    .then(function detectFace(image){
      console.log("TODO: detect face using Oxford API");
    })
    .then(function generateBubblePermutations(response){
      console.log("TODO: generate multiple images with head rotated");
    })
    .then(function generateGif(dimensions){
      console.log("TODO: generate GIF");
      return imgSrc;
    })
    .then(function displayGif(gifLocation){
      res.render('index', {title:'Done!', image: gifLocation})
    } );
})
module.exports = router;
