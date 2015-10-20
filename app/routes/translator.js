var fs = require('fs');
var locale = require('locale');
var languages = {};
var defaultLanguage = 'en';

var path = __dirname + '/../../translations'
var files = fs.readdirSync(path);

files.forEach(function(file){
	var languageString = file.replace('.json','');
	if(languageString.substr(0,1) == '_') return;
	languages[languageString] = require([path,file].join('/'));
});

exports.loadCopy = function(req, res, next) {
	var tgt = defaultLanguage
	if(req.query.lang) tgt = req.query.lang;
	if(req.query.language) tgt = req.query.language;
	if(req.params.language) tgt = req.params.language;
	if(req.params.lang) tgt = req.params.lang;
	if(!languages[tgt]) tgt = defaultLanguage;
	res.copy = languages[tgt];
	res.copy.currentLanguage = tgt;
	next();
}

exports.detectUserLanguage = function(req, res, next) {
	var locales = [];
	for(var key in languages) {
		locales.push(key);
	}
	var supported = new locale.Locales(locales);
	var requested = new locale.Locales(req.get("accept-language"));
	req.query.lang = requested.best(supported);
	if(locales.indexOf(req.query.lang) == -1) req.query.lang = defaultLanguage;
	next();
}