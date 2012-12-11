(function() {
  var Test, callMeBack, funcflow, str, test,
    __slice = [].slice;

  str = function(obj) {
    if (obj === null) {
      return "null";
    } else if (typeof obj === "undefined") {
      return "undefined";
    } else {
      return obj.toString();
    }
  };

  Test = (function() {

    function Test(name, func) {
      this.name = name;
      this.func = func;
      this.num = 0;
    }

    Test.prototype.expect = function(num) {
      return this.num = num;
    };

    Test.prototype.equal = function(arg1, arg2) {
      this.num--;
      if (arg1 !== arg2) {
        throw "'" + (str(arg1)) + "' does not equal '" + (str(arg2)) + "'";
      }
    };

    Test.prototype.ok = function(bool) {
      this.num--;
      if (!bool) {
        throw "false was passed to ok";
      }
    };

    Test.prototype.done = function() {
      if (this.num !== 0) {
        throw "" + (str(this.num)) + " more checks were expected before done was called";
      }
    };

    Test.prototype.run = function() {
      return this.func.call(this);
    };

    return Test;

  })();

  test = function(name, func) {
    var t;
    t = new Test(name, func);
    return exports[name] = function() {
      return t.run();
    };
  };

  exports.RunAll = function() {
    var name;
    for (name in exports) {
      if (name !== "RunAll") {
        try {
          exports[name]();
        } catch (ex) {
          console.log("Error in Test '" + name + "'");
          console.log(ex);
          console.log('');
        }
      }
    }
  };

  callMeBack = function() {
    var args, func;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return func.apply(null, args);
  };

  funcflow = require("../lib/funcflow");

  test("Basic", function() {
    var steps,
      _this = this;
    steps = [];
    steps.push(function(step, err) {
      return callMeBack(step.next, 1, 2, 3);
    });
    steps.push(function(step, err) {
      return callMeBack(step.next);
    });
    return funcflow(steps, this.done);
  });

  test("CallbackParameters", function() {
    var _this = this;
    this.expect(2);
    return funcflow([
      function(step, err) {
        return callMeBack(step.next, 1, 2);
      }, function(step, err, arg1, arg2) {
        _this.equal(arg1, 1);
        _this.equal(arg2, 2);
        return callMeBack(step.next);
      }
    ], this.done);
  });

  test("ParallelCode", function() {
    var _this = this;
    return funcflow([
      function(step, err) {
        callMeBack(step.spawn());
        callMeBack(step.spawn());
        callMeBack(step.spawn());
        return step.next();
      }
    ], this.done);
  });

  test("BasicErrorHandling", function() {
    var _this = this;
    this.expect(2);
    return funcflow([
      function(step, err) {
        throw "some error";
      }, function(step, err) {
        _this.equal(err, "some error");
        return step.next();
      }, function(step, err) {
        _this.equal(err, null);
        return step.next();
      }
    ], this.done);
  });

  test("ParallelErrorHandling", function() {
    var _this = this;
    this.expect(1);
    return funcflow([
      function(step, err) {
        callMeBack(step.spawn());
        callMeBack(step.spawn());
        throw "some error";
        return step.next();
      }, function(step, err) {
        _this.equal(err, "some error");
        return step.next();
      }
    ], this.done);
  });

  test("BubbleErrorHandling", function() {
    var exThrown;
    this.expect(1);
    exThrown = false;
    try {
      funcflow([
        function(step, err) {
          return step.raise("some error");
        }
      ]);
    } catch (ex) {
      exThrown = true;
    }
    this.ok(exThrown);
    return this.done();
  });

  test("DontCatchExceptions", function() {
    var exThrown;
    this.expect(1);
    exThrown = false;
    try {
      funcflow([
        function(step, err) {
          return math.kj;
        }
      ], {
        catchExceptions: false
      }, function() {});
    } catch (ex) {
      exThrown = true;
    }
    this.ok(exThrown);
    return this.done();
  });

  test("NoCallback", function() {
    var _this = this;
    this.expect(1);
    funcflow([
      function(step, err) {
        return _this.ok(true);
      }
    ]);
    return this.done();
  });

  test("BasicStateTest", function() {
    var sharedState,
      _this = this;
    this.expect(4);
    sharedState = {
      sharedstr: "not modified",
      sharedfunc: function() {
        return true;
      }
    };
    return funcflow([
      function(step, err) {
        _this.equal(step.sharedstr, "not modified");
        _this.equal(step.sharedfunc(), true);
        step.sharedstr = "modified";
        step.sharedfunc = function() {
          return false;
        };
        return step.next();
      }, function(step, err) {
        _this.equal(step.sharedstr, "modified");
        _this.equal(step.sharedfunc(), false);
        return step.next();
      }
    ], sharedState, this.done);
  });

}).call(this);
