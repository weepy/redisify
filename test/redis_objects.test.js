
/**
 * Module dependencies.
 */

var ro = require('../lib/redis_objects'),
    redis = require("redis"),
    client = redis.createClient(),
    should = require('should')

client.on("error", function (err) {
    console.log("Redis connection error to " + client.host + ":" + client.port + " - " + err);
});

exports.test_version =  function(done) {
  ro.version.should.match(/^\d+\.\d+\.\d+$/);
  done()
}

exports.zero_tasks = function(done) {
  client.select(15)
  client.FLUSHDB(function() { done() })
}

function User(id) {
  this.id = id
  this.namespace = "User:" + id + ":"
}
User.namespace = "Users:"
ro.mixin(User)
ro.mixin(User.prototype)
ro.client = client

exports.test_set = function(done) {
  User.set("xxx", 123, function(data) {
    data.should.eql("OK")
    done()
  })
}

exports.test_get = function(done) {
  User.get("xxx", function(res) {
    res.should.eql("123")
    done()
  })
}

exports.test_stack = function(done) {
  User.get("xxx", function(res, callback) {
    callback(res+"4")
  }, function(res) {
		res.should.eql("1234")
		done()
  })
}

exports.test_prototype = function(done) {
  var u = new User()
  u.get("XXX", function(res) {
    should.ok(res == null)
    done()
  })
}


exports.test_list = function(done) {
  
  User.llen("list", function(res) {
    should.ok(res == 0)
  })
  
  for(var i=0; i< 10; i++) {
    (function(i) {
      User.rpush("list", "one" + i, function(res) {
        res.should.eql(i+1)
      })
    })(i)
  }
  
  
  User.llen("list", function(res) {
    should.ok(res == 10)
    done()
  })
}

exports.test_lrange = function(done) {

  User.lrange("list", 0, 5, function(res) {
    res.length.should.eql(6)
  })
    
  User.lrange("list", 0, 100, function(res) {
    res.length.should.eql(10)
    done()
  })
  
}


function User2(id) {
  this.id = id
  this.key = "User:" + id + ":"
}
User2.key = "Users:"
ro.mixin(User2, {mount: "db", namespace_property: "key"})
ro.mixin(User2.prototype, {mount: "db", namespace_property: "key"})

exports.test_set2 = function(done) {
  User2.db.set("xxx", 123, function(data) {
    data.should.eql("OK")
    done()
  })
}

exports.test_get2 = function(done) {
  User2.db.get("xxx", function(res) {
    res.should.eql("123")
    done()
  })
}


exports.cleanup = function(done) {
  client.quit() 
  done()
}


