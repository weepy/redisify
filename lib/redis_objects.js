
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

var all_commands = "get set setnx setex append substr strlen del exists incr decr mget".split(" ")

ro.mixin = function(object, opts) {
  opts = opts || {}
  
  var at = opts.at ? (object[opts.at] = object[opts.at] || {})
                   : object 

  var commands = opts.commands || all_commands
  var namespace = opts.namespace_property || "namespace"
  
  for(var i=0; i < commands.length;i++) {
   at[commands[i]] = (function(cmd) {
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
    
    args[0] = (namespace || "") + ":" + args[0]
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
