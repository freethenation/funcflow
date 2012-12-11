(function() {
  var Flow, FlowStep, flow,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  FlowStep = (function() {

    function FlowStep(func, lastReturn, state, callback) {
      this.callback = callback;
      this.next = __bind(this.next, this);

      this._next = __bind(this._next, this);

      this.spawn = __bind(this.spawn, this);

      this.raise = __bind(this.raise, this);

      if (!(state.catchExceptions != null)) {
        state.catchExceptions = true;
      }
      this.state = state;
      state.next = this.next;
      state.spawn = this.spawn;
      state.raise = this.raise;
      this.threads = [];
      this._unjoinedThreadCount = 1;
      if (this.state.catchExceptions) {
        try {
          lastReturn.unshift(state);
          func.apply(null, lastReturn);
        } catch (ex) {
          if (this.state.catchExceptions) {
            this.callback([ex]);
          } else {
            throw ex;
          }
        }
      } else {
        lastReturn.unshift(state);
        func.apply(null, lastReturn);
      }
    }

    FlowStep.prototype.raise = function(ex) {
      this.state.catchExceptions = false;
      if (typeof ex === "undefined" || ex === null) {
        throw "Can not raise null or undefined exception. Call to step.raise() has failed!";
      }
      throw ex;
    };

    FlowStep.prototype.spawn = function() {
      var threadId,
        _this = this;
      this._unjoinedThreadCount++;
      threadId = this.threads.length;
      this.threads.push([null]);
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.unshift(null);
        _this.threads[threadId] = args;
        _this._unjoinedThreadCount--;
        return _this._next();
      };
    };

    FlowStep.prototype._next = function() {
      if (this._unjoinedThreadCount === 0) {
        if (this.threads.length === 1) {
          this.threads = this.threads[0];
        }
        return this.callback(this.threads);
      }
    };

    FlowStep.prototype.next = function() {
      if (arguments.length > 0) {
        this.spawn().apply(null, arguments);
      }
      this._unjoinedThreadCount--;
      this._next();
    };

    return FlowStep;

  })();

  Flow = (function() {

    function Flow(steps, state, callback) {
      this.steps = steps;
      if (state == null) {
        state = null;
      }
      if (callback == null) {
        callback = null;
      }
      this.run = __bind(this.run, this);

      if (!(callback != null)) {
        callback = state;
        state = null;
      }
      if (!(callback != null)) {
        callback = function() {};
      }
      if (!(state != null)) {
        state = {};
      }
      this.steps.push(callback);
      this.state = state;
    }

    Flow.prototype.run = function() {
      var i, _run,
        _this = this;
      i = -1;
      _run = function(lastReturn) {
        var step;
        i++;
        if (i < _this.steps.length) {
          return step = new FlowStep(_this.steps[i], lastReturn, _this.state, _run);
        }
      };
      _run([null]);
    };

    return Flow;

  })();

  flow = function(steps, state, callback) {
    (new Flow(steps, state, callback)).run();
  };

  if (typeof module !== 'undefined') {
    module.exports = flow;
  } else {
    window.funcflow = flow;
  }

}).call(this);
