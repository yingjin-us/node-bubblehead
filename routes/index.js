var express = require('express');
var router = express.Router();
var fs = require('fs');
var jimp = require('jimp');
var oxford = require('project-oxford');
var GIFEncoder = require('gifencoder');
var pngFileStream = require('png-file-stream');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/',(req,res,next) => {
  var imgSrc = req.file? req.file.path : '';
  Promise.resolve(imgSrc)
    .then(function detectFace(image){
      var oxfordClient = new oxford.Client(process.env.OXFORD_API);
      return oxfordClient.face.detect({path:image,analyzesAge:true, analyzesGender:true});
    })
    .then(function generateBubblePermutations(response){
      promises=[];
      degrees = [10,0,-10];

      for(var i=0; i<degrees.length; i++){
        var outputName = req.file.path +'_' + i + '.png';
        promises.push(cropHeadAndPasteRotated(req.file.path, response[0].faceRectangle,degrees[i], outputName))
      }
      return Promise.all(promises);
    })
    .then(function generateGif(dimensions){
      return new Promise((resolve,reject) => {
        var encoder = new GIFEncoder(dimensions[0][0],dimensions[0][1]);
        pngFileStream(req.file.path + '_?.png')
          .pipe(encoder.createWriteStream({repeat:0,delay:500}))
          .pipe(fs.createWriteStream(req.file.path +'.gif'))
          .on('finish', () => {
            resolve(req.file.path+'.gif');
          });
      });
    })
    .then(function displayGif(gifLocation){
      res.render('index', {title:'Done!', image: gifLocation})
    } );
})

function cropHeadAndPasteRotated(inputFile, faceRectangle, degrees, outputName){
  return new Promise((resolve, reject) => {
    jimp.read(inputFile).then((image) => {
      // Face detection only captures a small portion of the face,
      // so compensate for this by expanding the area appropriately.
      var height = faceRectangle['height'];
      var top = faceRectangle['top']- height*0.5;
      height*= 1.6;
      var left = faceRectangle['left'];
      var width = faceRectangle['width'];
      // Crop head, scale up slightly, rotate, and paste on original image
      image.crop(left, top, height, width)
        .scale(1.05)
        .rotate(degrees, (err, rotated) => {
          jimp.read(inputFile).then((original) => {
            original.composite(rotated, left-0.1*width, top-0.05*height)
              .write(outputName,() => {
                resolve([original.bitmap.width, original.bitmap.height]);
              });
          });
        });
    });
  });
}
module.exports = router;
