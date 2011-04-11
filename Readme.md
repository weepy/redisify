# Redis Objects


* Mixin redis commands to an object
* Use the objects namespace property to namespace redis calls
* Also provides an async stack for manipulating redis return value (obvious usecase - bulk load objects from redis ids)



## Usage

<pre>
_object_ = redisify.mixin(client, namespace)
</pre>

* at: where to mount the redis commands (defaults to null => on the object itself)
* namespace_fn: name of property that contains the namespace (defaults to 'namespace')
* commands: array of redis properties to mixin (defaults to all commands)
* client: redis client


## Examples

<pre>
var redisify = require("redisify")
var client = require("redis").createClient()

var User = {
  key: "Users"
}
User.redis = redisify(client)

User.redis("get", "xx", function(val) {
  // redis "get Users:xx"
  // User == this
})
</pre>

It can be mixed into a prototype as well: 

<pre>
function User(id) {
  this.key = "User:" + id
}

User.prototype.redis = redisify(client)

var user = new User(42)

user.redis("get", "xx", function(val) {
  // redis "get User:42:xx" 
  // user == this
})

</pre>

## Example 2

Showing transformations: trailing function calls are called as an asynchronous stack of maps. 

Eg. if User.load_bulk might instantiate a list of User objects from a list of ids: 

<pre>
User.redis("smembers", "all", User.load_bulk, function(users) {
  // users is now a list of instantiated objects
})
</pre>

## Example 3

Showing mounting to a different part of the object and a different property

<pre>
var User = {
  namespace: "Users"
}

User
User.db = redisify(client, "namespace")

User.db("get", "mystring", function(val) {
  // redis "get Users:mystring"
  // User == this
})
</pre>



## Install

<pre>
npm install redisify
</pre>

## run tests

<pre>
make
</pre>


## License 

(The MIT License)

Copyright (c) 2011 weepy &lt;jonahfox@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.