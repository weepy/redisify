
/*!
 * ro
 * Copyright(c) 2011 weepy <jonahfox@gmail.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

var chain = require("./chain")
var ro = function() {}
ro.version = '0.0.1';

function noop() {}

var all_commands = [
    // string commands
    "get", "set", "setnx", "setex", "append", "substr", "strlen", "del", "exists", "incr", "decr", "mget", 
    // list commands
    "rpush", "lpush", "rpushx", "lpushx", "linsert", "rpop", "lpop", "brpop", "blpop", "llen", "lindex", "lset", "lrange", "ltrim", "lrem", "rpoplpush",
    // set commands
    "sadd", "srem", "smove", "sismember", "scard", "spop", "srandmember", "sinter", "sinterstore", "sunion", "sunionstore", "sdiff", "sdiffstore", "smembers",
    // sorted set commands
    "zadd", "zincrby", "zrem", "zremrangebyscore", "zremrangebyrank", "zunionstore", "zinterstore", "zrange", "zrangebyscore", "zrevrangebyscore", 
    "zcount", "zrevrange", "zcard", "zscore", "zrank", "zrevrank",
    // hash commands
    "hset", "hsetnx", "hget", "hmget", "hincrby", "hdel", "hlen", "hkeys", "hgetall", "hexists", "incrby", "decrby",
    //bit commands
    "getbit", "setbit", "getrange", "setrange",
    // misc
    "getset", "mset", "msetnx", "randomkey", "select", "move", "rename", "renamenx", "expire", "expireat", "keys", "dbsize", "ping", "echo",
    "save", "bgsave", "bgwriteaof", "shutdown", "lastsave", "type", "sync", "flushdb", "flushall", "sort", "info", 
    "monitor", "ttl", "persist", "slaveof", "debug", "config", "subscribe", "unsubscribe", "psubscribe", "punsubscribe", "publish", "watch", "unwatch",
    "quit"
]

ro.mixin = function(object, opts) {
  opts = opts || {}
  
  var mount = opts.mount
                ? (object[opts.mount] = object[opts.mount] || {})
                : object 

  var commands = opts.commands || all_commands
  var namespace = opts.namespace_property || "namespace"
  
  for(var i=0; i < commands.length;i++) {
   mount[commands[i]] = (function(cmd) {
      var namespace = object[namespace] 
      return function() {       
        var args = Array.prototype.slice.call(arguments, 0)
        run.call(object, cmd, namespace, args)
      }
    })(commands[i])
  }   
  
  function run(command, namespace, args) {
    var client = opts.client || ro.client
    
    var stack = []
   	for(var i=args.length - 1; i >= 0; i--) {
      var fn = args[i]; 
      if(typeof fn != "function") break
			stack.unshift(args.pop())
    }
    
    args[0] = (namespace || "") + args[0]
    client[command](args, function(err, data) { 
      if(err) { 
        console.log(err)
        throw err
      }
      chain.apply(null, stack)(data)    
    })
  }
}

module.exports = ro
