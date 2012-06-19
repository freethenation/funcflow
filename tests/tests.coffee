test=(name, func)->
    exports[name]=(test)->
        doneCalled = false
        oldDone = test.done
        test.done=()->
            if !doneCalled
                doneCalled = true
                test.ok(true)
                oldDone()
        oldExpect = test.expect
        test.expect=(num)->
            oldExpect(num+1)
        try
            func.call(test)
        catch ex
            test.ok(false, ex.toString())
            test.done()

callMeBack=(func, args...)->
    func.apply(null, args)

funcflow=require('../lib/funcflow.js')

test "basic", ()->
    steps = []
    steps.push (step, err)=>
        callMeBack(step.next, 1, 2, 3)
    steps.push (step, err)=>
        callMeBack(step.next)
    funcflow(steps, @done)

test "callback parameters", ()->
    @expect(2)
    funcflow([
        (step, err)=>
            callMeBack(step.next, 1, 2)
        (step, err, arg1, arg2)=>
            @equal(arg1, 1)
            @equal(arg2, 2)
            callMeBack(step.next)
    ], @done)

test "parallel code", ()->
    funcflow([
        (step, err)=>
            callMeBack(step.spawn())
            callMeBack(step.spawn())
            callMeBack(step.spawn())
            step.next()
    ], @done)

test "basic error handling", ()->
    @expect(2)
    funcflow([
        (step, err)=>
            throw "some error"
        (step, err)=>
            @equal(err, "some error")
            step.next()
        (step, err)=>
            @equal(err, null)
            step.next()
    ], @done)

test "parallel error handling", ()->
    @expect(1)
    funcflow([
        (step, err)=>
            callMeBack(step.spawn())
            callMeBack(step.spawn())
            throw "some error"
            step.next()
        (step, err)=>
            @equal(err, "some error")
            step.next()
    ], @done)

test "bubble error handling", ()->
    @expect(1)
    @throws(funcflow([
        (step, err)=>
            step.raise("some error")
    ], ()->))
    @done()

test "no callback", ()->
    @expect(1)
    funcflow([
        (step, err)=>
            @ok(true)
    ])
    @done()

test "basic state test", ()->
    @expect(4)
    sharedState = {
        sharedstr: "not modified"
        sharedfunc: ()->true
    }
    funcflow([
        (step, err)=>
            @equal(step.sharedstr, "not modified")
            @equal(step.sharedfunc(), true)
            step.sharedstr = "modified"
            step.sharedfunc = ()->false
            step.next()
        (step, err)=>
            @equal(step.sharedstr, "modified")
            @equal(step.sharedfunc(), false)
            step.next()
    ], sharedState, @done)
