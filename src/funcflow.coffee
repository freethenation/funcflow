class FlowStep
    constructor:(func, lastReturn, state, @callback)->
        state.next = @next
        state.spawn = @spawn
        state.raise = @raise
        @threads=[]
        @_unjoinedThreadCount=1
        try
            lastReturn.unshift(state)
            func.apply(null, lastReturn)
        catch ex
            @callback([ex])
    raise:(ex)->throw ex
    spawn:()=>
        @_unjoinedThreadCount++
        threadId=@threads.length
        @threads.push([null])
        return (args...)=>
            args.unshift(null)
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
    constructor:(@steps, state=null, callback=null)->
        if not callback?
            callback = state
            state = null
        if not callback? then callback=()->
        if not state? then state = {}
        @steps.push(callback)
        @state = state
    run:()=>
        i=-1
        _run=(lastReturn)=>
            i++
            if i < @steps.length
                step = new FlowStep(@steps[i], lastReturn, @state, _run)
        _run([null])
        return

flow=(steps, state, callback)->
    (new Flow(steps, state, callback)).run()
    return

if(typeof(module)!='undefined') then module.exports = flow
else window.flow = flow
