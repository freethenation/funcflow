class FlowStep
    constructor:(func, lastReturn, ops, @callback)->
        @[op]=ops[op] for op of ops
        @threads=[]
        @_unjoinedThreadCount=1
        try
            lastReturn.unshift(this)
            func.apply(null, lastReturn)
        catch ex
            console.log(ex)
            @callback([ex])
    raise:(ex)->throw ex
    spawn:()=>
        @_unjoinedThreadCount++
        threadId=@threads.length
        @threads.push([undefined])
        return (args...)=>
            args.unshift(undefined)
            @threads[threadId] = args
            @_unjoinedThreadCount--
            @_next()
    _next:()=>
        if @_unjoinedThreadCount == 0
            if @threads.length == 1
                @threads=@threads[0]
            @callback(@threads)
    next:()=>
        if arguments.length > 0
            @spawn().apply(null, arguments)
        @_unjoinedThreadCount--
        @_next()
        return

class Flow
    constructor:(@steps, ops=null, callback=null)->
        if not callback?
            callback = ops
            ops = null
        if not callback? then callback=()->
        if not ops? then ops = {}
        @steps.push(callback)
        @ops = ops
    run:()=>
        i=-1
        _run=(lastReturn)=>
            i++
            if i < @steps.length
               new FlowStep(@steps[i], lastReturn, @ops, _run)
        _run([undefined])
        return

flow=(steps, ops, callback)->
    (new Flow(steps, ops, callback)).run()
    return

if(typeof(window)=='undefined') then module.exports = flow
else window.flow = flow
