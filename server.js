const express = require("express");
const app = express();
var path = require("path");
var fs = require("fs");
app.set('PORT', 3000);

app.use(express.json());

app.use ((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
 
    next();
});

const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect('mongodb+srv://lc1232_db_user:kRe411FRTQsnVB4Y@m00913284-cst3144.ail8qtc.mongodb.net', (err, client) => {
    db = client.db("CST3144_M00913284");
});

const ObjectID = require('mongodb').ObjectID;
app.get('/', (req, res, next) => {
    res.send("select a collection, e.g., /collection/messages")
});

app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next (e)
            res.send(results);

            console.log("\ngetting lessons on: " + new Date());
            console.log(results);
    });
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next (e)
            res.send(results.ops);

        console.log("\nadding order on: " + new Date());
        console.log(results);
    });
});

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id)}, (e, results) => {
        if (e) return next(e)
            res.send(results);
            console.log("\ngetting lesson on: " + new Date());
            console.log(results);
    });
});

app.get('/search/:collectionName', (req, res, next) => {
    const query = {};

    query['$or'] = [
        {subject: {$regex: req.query.search, $options: 'i'}} ,
        {location: {$regex: req.query.search, $options: 'i'}},
        {price: {$regex: req.query.search, $options: 'i'}},
        {availability: {$regex: req.query.search, $options: 'i'}}
    ];

    req.collection.find(query).toArray((err, results) => {
        if (err) return next(err);
        res.json(results);
        let stringQuery = JSON.stringify(req.query.search);
        console.log(new Date() + ` - searching ${stringQuery} in ${req.params.collectionName}`);
    });
});

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, results) => {
            if (e) return next(e)
                res.send((results.matchedCount === 1) ? {msg: 'success'} : {msg: 'error'});
                console.log("\nupdating availability on: " + new Date());
                console.log(results);
        });
});

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e, results) => {
            if (e) return next(e)
                res.send((results.results.n === 1) ? {msg: 'success'} : {msg: 'error'});
        });
});

app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function(err, fileInfo){
        if (err){
            next();
            return;
        }
        if (fileInfo.isFile()){
            res.sendFile(filePath);
        }
        else next();
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("express.js server is running on localhost:3000");
});
