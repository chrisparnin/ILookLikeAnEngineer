var Twit = require('twit');
var jsonfile = require('jsonfile');
var _ = require("underscore");
var config = require('./config.js');

var T = new Twit(
{
	consumer_key:         config.consumer_key,
	consumer_secret:      config.consumer_secret,
	access_token:         config.access_token,
	access_token_secret:  config.access_token_secret
});

var tag = '#ILookLikeAnEngineer since:2015-08-03 exclude:retweets'
var output = "statuses.json";

var sum   = 0;
var total = 10000;
var allStatuses = {};

var process = 
{
	start: function()
	{
		T.get('search/tweets', 
			{ q: tag, count: 100, result_type: 'recent' }, ProcessResults
		);
	},
	onDone: function()
	{
		jsonfile.writeFile("statuses.json", allStatuses, function (err)
		{
  			console.error(err);
		});
	}
};
process.start();

function SearchTweetsSince(tag,sinceId)
{
	T.get('search/tweets', 
		{ q: tag, count: 100, result_type: 'mixed', max_id: sinceId },
		ProcessResults
	);
}

function ProcessResults (err, data, response) 
{
	if( data.statuses.length == 0 )
	{
		process.onDone();
		return;
	}

	var lastId = data.statuses[data.statuses.length-1].id_str;
	var firstId = data.statuses[0].id_str;
	console.log(firstId,lastId);
	//console.log( _.keys(allStatuses).length, JSON.stringify(data.search_metadata, 3, null) );

	//allStatuses.push.apply(allStatuses, data.statuses);
	for( var i = 0; i < data.statuses.length; i++ )
	{
		var s = data.statuses[i];
		allStatuses[s.id_str] = s;
	}

	if( _.keys(allStatuses).length >= total  )
	{
		console.log("max:", data.search_metadata.max_id, "first:", firstId, "last:", lastId);
		process.onDone();
	}
	else
	{
		setTimeout(function() {SearchTweetsSince(tag, parseInt(lastId));}, 1000);
	}
}