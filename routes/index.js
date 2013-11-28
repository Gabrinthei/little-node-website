var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var XmlStream = require('xml-stream');
var parseString = xml2js.parseString;
var parser = xml2js.Parser();
var inspect = require('eyes').inspector({maxLength: false});
var request = require('request');
var _ = require('underscore');

//Render's landing page
exports.index = function(req, res){
    res.render('index', { title: 'The personal site of James Sonntag' });
};

//Render's 
exports.helloworld = function(req, res){
    res.render('helloworld', {title: 'Hello, World!'});
};

//Render's resume page
exports.cv = function(req, res){
    res.render('cv', { title: "James Sonntag's Resume" });
};

//Render's list of blogs
exports.blog = function(db) {
    return function(req, res){
        var blog = db.get('blog');
        blog.find({},{},function(e,docs){
            res.render('thoughts', {
                title: 'Random thoughts of James Sonntag',
                "bloglist" : docs
            });
        });
    };
};

//Render's the specific blog
exports.getblog = function(db) {
    return function(req, res){
        var blog = db.get('blog');
        var titlename = req.params.name.replace(/-/g, ' ');
        if (titlename.toLowerCase() != titlename)
        {
            res.writeHead(301, {'Location': req.params.name.toLowerCase()});
            res.end();
        }
        titlename = new RegExp(["^",titlename,"$"].join(""),"i");
        blog.findOne({title: titlename},{},function(e,docs){
            res.render('helloworld', {
                title: docs.title + ' by ' + docs.author,
                "blog" : docs
            });
        });
    };
};

//Render's new blog page
exports.newblog = function(req, res){
    res.render('newblog', {title: "Add new blog"});
};

//Post method to add a new blog to database
exports.addblog = function(db) {
    return function(req, res) {
        var author = req.body.author;
        var title = req.body.title;
        var body = req.body.body;
        var username = req.body.username;
        var password = req.body.password;

        var blogs = db.get('blog');
        var login = db.get('login');

        login.findOne({},{},function(e,docs){
            if (username == docs.username && password == docs.password)
            {
                blogs.insert({
                    "author" : author,
                    "title" : title,
                    "body" : body,
                    "publishDate" : Date()
                }, function(err, doc){
                    if (err) {
                        res.send("There was a problem");
                    }
                    else {
                        res.location('thoughts');
                        res.redirect('thoughts');
                    }
                });
            }
            else
                res.send("Invalid User/Password");
        });
    }
}


//In Development -- A tool that creates a list of keywords suggested by google
//TODO -- Pick keywords with higher value; join keywords together for long tail results; 
//        make sure the keywords stay relevant; handle errors when google stops me.
exports.keywords = function(){
    return function (req, res){
        something = {};
        count = 1;
        kill = false;
        getKeywordSuggestion({'keyword': 1});

        function getKeywordSuggestion(keyword){
            if (kill)
                return;
            for (var key in keyword){
                console.log(key);
                request.get('http://toolbarqueries.google.com/complete/search?q=' + key + 
                '&output=toolbar&hl=en', getData);
            }
            
        }

        function getData(err, res, body){
            if (err) return console.error(err);
            processData(body, count+=1);
        }

        function processData(newKeywords, count){
            var phrases = {};
            var keywords = {};
            parser.parseString(newKeywords, function(err, result){
                top = result.toplevel.CompleteSuggestion
                for (var item in top){
                    lower = result.toplevel.CompleteSuggestion[item].suggestion
                    for (var value in lower){
                        if (!(lower[value].$.data in phrases)){
                            phrases[lower[value].$.data] = 1;
                        }else{
                            phrases[lower[value].$.data] += 1
                        }
                    }
                }
                var phraseArray = Object.keys(phrases);
                for (var phrase in phraseArray){
                    var keywordArray = phraseArray[phrase].split(' ');
                    for (var keyword in keywordArray){
                        if (Object.keys(keywords).indexOf(keywordArray[keyword]) <= -1){
                            keywords[keywordArray[keyword]] = 1;
                        }
                        else{
                            keywords[keywordArray[keyword]] += 1;
                        }
                    }
                }
            });

            if (count < 10){
                something = _.extend(something, phrases);
                getKeywordSuggestion(keywords);
            }
            else if (!kill){
                finalRender(something);
                kill = true;
            }
        }

        function finalRender(finalKeywords){
            //console.log(finalKeywords);
            console.log(kill);
            res.render('keywords', {
                title: 'dowap',
                "keywords" : Object.keys(finalKeywords)
            });
        }
    }
}
    