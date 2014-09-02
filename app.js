/**
 * Created by Emmanuel on 27.08.2014.
 */

var express = require('express');
var bodyParser = require("body-parser");
var LinkDump = require('./models/linkDump');
var mongoose   = require('mongoose');
var request = require('request');

var connection_string = 'mongodb://localhost/test';

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(connection_string);

var ip_addr = process.env.OPENSHIFT_NODEJS_IP  || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.use(function(req,res,next){
    console.log('Got an  hit');
    next();
});
router.all('*',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    next();
});
router.get('/api',function(req,res){
    res.json({message : "Welcome to link_dump API"});
});
router.route('/api/linkdump')
    .post(function (req, res) {
        console.log(req.body.links);

        var linkDump = new LinkDump();
        linkDump.links = req.body.links;

        linkDump.save(function(err){
            if(err){
                res.status(500).send(err);
            }else{
                res.status(200).json({id:linkDump.id});
            }

        });
    })
    .get(function(req,res){
        LinkDump.find(function(err,linkDumps){
            if(!err){
                res.status(200).json(linkDumps);

            }else{
                res.status(500).send(err);
            }


        })
    });
router.get('/api/linkdump/:id',function(req,res){
    LinkDump.findOne({ '_id': req.params.id }, function (err, linkDump) {
        if (!err){
            res.status(200).json(linkDump);
        }else{
            res.status(500).json(err);
        }


    });
});
router.get('/api/geturltitle/:link',function(req,res){
    console.log("requesting "+req.params.link);

    request(req.params.link, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            res.status(200).json({title: body.match("<title>(.*?)</title>")[1]});
        }else{
            res.status(400).json({error:error});
        }
    });
});

router.post('/api/geturltitle',function(req,res){
    console.log("requesting (POST) "+req.body.link);

    request(req.body.link, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            res.status(200).json({title: body.match("<title>(.*?)</title>")[1]});
        }else{
            res.status(400).json({error:error});
        }
    });

});

router.get('/*',function(req,res){
    res.json({message:"Welcome to link_dump"});
});

app.use(router);
app.listen(port,ip_addr,function(){
    console.log("Server Listening on "+ port);
});