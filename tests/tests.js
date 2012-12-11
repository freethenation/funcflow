(function() {
  var callMeBack, funcflow, test,
    __slice = [].slice;

  test = function(name, func) {
    return exports[name] = function(test) {
      var doneCalled, oldDone, oldExpect;
      doneCalled = false;
      oldDone = test.done;
      test.done = function() {
        if (!doneCalled) {
          doneCalled = true;
          test.ok(true);
          return oldDone();
        }
      };
      oldExpect = test.expect;
      test.expect = function(num) {
        return oldExpect(num + 1);
      };
      try {
        return func.call(test);
      } catch (ex) {
        test.ok(false, ex.toString());
        return test.done();
      }
    };
  };

  callMeBack = function() {
    var args, func;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return func.apply(null, args);
  };

  funcflow = require("../lib/funcflow");

  test("basic", function() {
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

  test("callback parameters", function() {
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

  test("parallel code", function() {
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

  test("basic error handling", function() {
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

  test("parallel error handling", function() {
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

  test("bubble error handling", function() {
    var exThrown,
      _this = this;
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

  test("no callback", function() {
    var _this = this;
    this.expect(1);
    funcflow([
      function(step, err) {
        return _this.ok(true);
      }
    ]);
    return this.done();
  });

  test("basic state test", function() {
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
