
/**
 * Module dependencies.
 */

var newrelic = require('newrelic');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('174.45.68.139:27017/website');


var app = express();

// all environments
app.set('port', process.env.PORT || 9250);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico'))); 
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());

// Handle 404- Just redirecting to homepage atm
//app.use(function(req, res) {
//	res.render('index', { title: 'The personal site of James Sonntag' });
//});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/helloworld', routes.helloworld);
app.get('/thoughts', routes.blog(db));
app.get('/newblog', routes.newblog);
app.get('/resume', routes.cv);
app.post('/thoughts/:name', routes.getblog(db));
app.get('/keywords', routes.keywords);

//Posts
app.post('/addblog', routes.addblog(db));
app.get('/face', routes.keywords());


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
