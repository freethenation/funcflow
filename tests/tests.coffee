str=(obj)->
    if obj == null then "null"
    else if typeof obj == "undefined" then "undefined"
    else obj.toString()

class Test
    constructor:(@name, @func)->
        @num = 0
    expect:(num)->
        @num = num
    equal:(arg1, arg2)->
        @num--
        if arg1 != arg2 then throw "'#{str(arg1)}' does not equal '#{str(arg2)}'"
    ok:(bool)->
        @num--
        if not bool then throw "false was passed to ok"
    done:()->
        if @num != 0 then throw "#{str(@num)} more checks were expected before done was called"
    run:()->
        @func.call(this)
        
test=(name, func)->
    t = new Test(name, func)
    exports[name]=()->t.run()

exports.RunAll = ()->
    for name of exports
        if name != "RunAll"
            try
                exports[name]()
            catch ex
                console.log "Error in Test '#{name}'"
                console.log ex
                console.log ''
    return
    
callMeBack=(func, args...)->
    func.apply(null, args)

funcflow=require("../lib/funcflow")

test "Basic", ()->
    steps = []
    steps.push (step, err)=>
        callMeBack(step.next, 1, 2, 3)
    steps.push (step, err)=>
        callMeBack(step.next)
    funcflow(steps, @done)

test "CallbackParameters", ()->
    @expect(2)
    funcflow([
        (step, err)=>
            callMeBack(step.next, 1, 2)
        (step, err, arg1, arg2)=>
            @equal(arg1, 1)
            @equal(arg2, 2)
            callMeBack(step.next)
    ], @done)

test "ParallelCode", ()->
    funcflow([
        (step, err)=>
            callMeBack(step.spawn())
            callMeBack(step.spawn())
            callMeBack(step.spawn())
            step.next()
    ], @done)

test "BasicErrorHandling", ()->
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

test "ParallelErrorHandling", ()->
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

test "BubbleErrorHandling", ()->
    @expect(1)
    exThrown = false
    try
        funcflow([(step, err)->step.raise("some error")])
    catch ex
        exThrown = true
    @ok(exThrown)
    @done()
    
test "DontCatchExceptions", ()->
    @expect(1)
    exThrown = false
    try
        funcflow([(step, err)->math.kj], {catchExceptions:false}, ()->)
    catch ex
        exThrown = true
    @ok(exThrown)
    @done()

test "NoCallback", ()->
    @expect(1)
    funcflow([
        (step, err)=>
            @ok(true)
    ])
    @done()

test "BasicStateTest", ()->
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
