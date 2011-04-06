var chain = require("../lib/chain")
var should = require("should")

exports.test_chain = function(done) {
  chain(
    function(a,b,c, callback) {
      callback(a+1,b,"a")
    },
    function(a,b,c, callback) {
      callback(a+2,b,"b")
    }, 
    function(a,b,c) {
      a.should.eql(4)
      b.should.eql(2)
      c.should.eql('b')
      done()
    }
  )(1,2,3)
  
}