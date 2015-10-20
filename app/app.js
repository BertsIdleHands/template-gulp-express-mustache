var express 		= require('express'),
	mustacheExpress = require('mustache-express'),
	bodyParser 		= require('body-parser');

var translator 		= require('./routes/translator.js');

var app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('view cache', false);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(3333, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

app.get('/', translator.detectUserLanguage, function(req, res){
	res.redirect(req.query.lang + '/');
});

var router = express.Router();
router.get('/', function (req, res, next) {
	res.render('index', { copy : res.copy });
});

app.use('/:language(en)', translator.loadCopy, router);