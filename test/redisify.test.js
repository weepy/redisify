
/**
 * Module dependencies.
 */

var redisify = require('../lib/redisify'),
    redis = require("redis"),
    client = redis.createClient(),
    should = require('should')

client.on("error", function (err) {
    console.log("Redis connection error to " + client.host + ":" + client.port + " - " + err);
});

exports.test_version =  function(done) {
  redisify.version.should.match(/^\d+\.\d+\.\d+$/);
  done()
}

exports.zero_tasks = function(done) {
  client.select(15)
  client.FLUSHDB(function() { done() })
}

function User(id) {
  this.id = id
}

User.prototype.key = function() {
  return "User:" + this.id
}

var commands = ["get", "set", "list", "lrange", "rpush", "llen"]

User.key = function() { return "Users" } 

User.redis = redisify(client)
User.prototype.redis = redisify(client)

exports.test_set = function(done) {
  User.redis("set", "xxx", 123, function(data) {
    data.should.eql("OK")
    done()
  })
}

exports.test_get = function(done) {
  User.redis("get", "xxx", function(res) {
    res.should.eql("123")
    done()
  })
}

exports.test_stack = function(done) {
  User.redis("get", "xxx", function(res, callback) {
    callback(res+"4")
  }, function(res) {
		res.should.eql("1234")
		done()
  })
}


exports.test_list = function(done) {
  
  User.redis("llen", "list", function(res) {
    should.ok(res == 0)
  })
  
  for(var i=0; i< 10; i++) {
    (function(i) {
      User.redis("rpush", "list", "one" + i, function(res) {
        res.should.eql(i+1)
      })
    })(i)
  }
  
  
  User.redis("llen", "list", function(res) {
    should.ok(res == 10)
    done()
  })
}

exports.test_lrange = function(done) {

  User.redis("lrange", "list", 0, 5, function(res) {
    res.length.should.eql(6)
  })
    
  User.redis("lrange", "list", 0, 100, function(res) {
    res.length.should.eql(10)
    done()
  })
  
}

exports.test_prototype = function(done) {
  var u = new User(12)
  u.redis("get", "XXX", function(res) {
    should.ok(res == null)
    done()
  })
  
  u.redis("set", "XXX", 1234, function(res) {
    should.ok(res == "OK")
  })
  
  u.redis("get", "XXX", function(res) {
    should.ok(res == 1234)
    done()
  })
  
}


exports.test_client_on_redisify_and_different_place = function(done) {
  var Task = {
    key: "Tasks"
  }
  Task.db = redisify()
  Task.db.client = client
  
  Task.db("set", "YYY", 123, function(res) {
    should.ok(res == "OK")
  })
  
  Task.db("get", "YYY", function(res) {
    should.ok(res == 123)
    done()
  })
}


exports.cleanup = function(done) {
  client.quit() 
  done()
}


