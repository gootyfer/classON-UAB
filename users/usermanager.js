var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

UserManager = function(host, port) {
  this.db= new Db('classon-uab', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

UserManager.prototype.getCollection= function(callback) {
	  this.db.collection('users', function(error, users_collection) {
	    if( error ) callback(error);
	    else callback(null, users_collection);
	  });
	};

	UserManager.prototype.findAll = function(callback) {
	    this.getCollection(function(error, users_collection) {
	      if( error ) callback(error);
	      else {
	        users_collection.find().toArray(function(error, results) {
	          if( error ) callback(error);
	          else callback(null, results);
	        });
	      }
	    });
	};


	UserManager.prototype.findById = function(id, callback) {
	    this.getCollection(function(error, users_collection) {
	      if( error ) callback(error);
	      else {
	        users_collection.findOne({_id: users_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
	          if( error ) callback(error);
	          else callback(null, result);
	        });
	      }
	    });
	};

	UserManager.prototype.save = function(users, callback) {
	    this.getCollection(function(error, users_collection) {
	      if( error ) callback(error);
	      else {
	        if( typeof(users.length)=="undefined")
	          users = [users];
	        console.log('saving users...');
	        users_collection.insert(users, function() {
	          callback(null, users);
	        });
	      }
	    });
	};

	exports.UserManager = UserManager;