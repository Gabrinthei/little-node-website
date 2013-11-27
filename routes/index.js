var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var XmlStream = require('xml-stream');
var parseString = xml2js.parseString;
var parser = xml2js.Parser();
var inspect = require('eyes').inspector({maxLength: false});


exports.index = function(req, res){
    //rewriter.rewrite('/somethingsometing');
    res.render('index', { title: 'The personal site of James Sonntag' });
};

//exports.keywords = function(req, res){
//    res.render('keywords', { title: 'Get some.. keywords that is'});
//};

exports.keywords = function(){
    return function (req, res){
        var fullPhrases = processKeywords('thingy', 0);
        
    };
};

function processKeywords(keyword, count){
    var fullPhrases = {};
    
    if (count >= 10){
        console.log(count);
        console.log(inspect(keyword));
        return fullPhrases;
    }
    if (typeof keyword === 'string'){
        var request = http.get("http://toolbarqueries.google.com/complete/search?q=" + keyword + "&output=toolbar&hl=en").on('response', function(response){
            var xml = new XmlStream(response, 'utf8');
            
            xml.on('data', function(data) {
                parser.parseString(data, function(err, result){
                    top = result.toplevel.CompleteSuggestion
                    for (var item in top){
                        lower = result.toplevel.CompleteSuggestion[item].suggestion
                        for (var value in lower){
                            if (!(lower[value].$.data in fullPhrases)){
                                fullPhrases[lower[value].$.data] = 1;
                            }else{
                                fullPhrases[lower[value].$.data] += 1
                            }
                            //console.log(inspect(fullPhrases));
                            //console.log(typeof fullPhrases)
                            //console.log(typeof 'hello');
                            
                            //TODO -- Need to add each new entry into dictionary etc.
                        }
                    }
                    //console.log(inspect(fullPhrases));
                    return processKeywords(fullPhrases, count);
                });
            });
        });
    }else if (count < 10){
        
        for (var phrases in keyword)
            fullPhrases = processKeywords(phrases, count+=1);
    }else
        console.log(inspect(fullPhrases));
        return fullPhrases;
}

exports.helloworld = function(req, res){
    //rewriter.rewrite('/somethingsometing');
    res.render('helloworld', {title: 'Hello, World!'});
};

exports.cv = function(req, res){
    //rewriter.rewrite('/somethingsometing');
    res.render('cv', { title: "James Sonntag's Resume" });
};

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

exports.newblog = function(req, res){
    res.render('newblog', {title: "Add new blog"});
};

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