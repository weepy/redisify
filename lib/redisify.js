
/*!
 * ro
 * Copyright(c) 2011 weepy <jonahfox@gmail.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

var chain = require("./chain")

var redisify = function(cl, key_prop) {
  
  key_prop = key_prop || "key"
  
  var fn = function() {
    var args = Array.prototype.slice.call(arguments, 0)
    var namespace = this[key_prop]
    
    if(typeof namespace == "function")
      namespace = namespace.call(this)
    
    var command = args.shift()

    var stack = []
   	for(var i=args.length - 1; i >= 0; i--) {
      if(typeof args[i] != "function") break
  		stack.unshift(args.pop())
    }

    args[0] = args[0] ? ":" + args[0] : ""
    args[0] = (namespace || "") + args[0]

    args.push(function(err, data) { 
      if(err) { 
        console.log(err)
        throw err
      }
      chain.apply(this, stack)(data)    
    })
    
    
    fn.log && fn.log("REDISIFY: " + command + " " + args.slice(0, args.length-1).join(" "))
    
    var client = cl || fn.client
    client[command].apply(client, args)
  }
  
  return fn
  
}

redisify.version = "0.0.1"

module.exports = redisify 