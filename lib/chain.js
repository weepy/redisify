module.exports = function chain() {
  var fns = Array.prototype.slice.call(arguments, 0)
  return function() {
    var args = Array.prototype.slice.call(arguments, 0)
    
    go(0, args)

    function go(i, input_args) {
      var fn = fns[i]
      if(!fn) return
      var args = input_args.concat([function() {
        var resulting_args = Array.prototype.slice.call(arguments, 0)
        go(i+1, resulting_args)
      }])
      fn.apply(null, args)
    }       
  }
}
