# FuncFlow
Simplifies asynchronous control flow in coffeescript making parallel code, synchronous code, and error handling simple
# Why make another control flow library?
___
* One often desires to pass additional state to all the functions. Most of the control flow libraries I have seen do not allow for this. The issue can be worked around with a closure but closures are exactly what we are trying to avoid!
* There are tons of control flow libraries out there but none of them seem to play well with coffeescript; they all override `this` which does not play well with coffeescript's bound function (`()=>`) syntax.

# Features
___
* Makes it easy to write synchronous code without nested callbacks
* Makes it easy to write parallel code without keeping track of all the pesky callbacks
* Allows all your functions to easily share state without using a closure
* Designed to be compatible with coffeescript's cool features
* Works in nodejs and the browser

# How to install
___
    $ npm install funcflow
# Basic usage
___
FuncFlow is really easy to use and consists of a single function to which you pass an array of functions to call.
The first parameter to each function is a reference to a `step` object which allows you to control the flow of the program.
If the previous function threw an error, it is passed as the second parameter to the next function. If there was no error, `null` is passed instead.
    
    steps = []
    steps.push (step, err)->
        console.log("working on the first thing")
        setTimeout(300, step.next)
    steps.push (step, err)->
        console.log("working on second thing whos callback returns stuff")
        setTimeout(300, step.next, "someString", 6969)
    # if the function calling the callback passes arguments, they are passed as additional arguments to the function.
    steps.push (step, err, someString, someNumber)->
        console.log("callback argument 1: " + someString)
        console.log("callback argument 2: " + someNumber)
        #If the current step does not need a callback simply call the next function yourself
        step.next()
    # to use the funcflow function require it and then pass in the steps and a callback
    funcflow = require('funcflow')
    funcflow(steps, ()->console.log('we are done!'))

# Error handling
___
Any errors that are thrown within a step are passed to the next step to be handled

    steps = []
    steps.push (step, err)->
        raise "I am the first step and I am throwing an error"
    steps.push (step, err)->
        if err
            console.log("The first step raised an error")
        step.next()
    steps.push (step, err)->
        # You can use the "raise" function on the step object so that your error will bot be caught
        step.raise("This error is not going to be caught and will bubble out") 
    funcflow = require('funcflow')
    funcflow(steps, ()->console.log('we are done!'))
# Parallel code
___
Using the spawn function on the step object you can run tasks in parallel and the next step will only be 
run when all of the tasks are complete

    steps = []
    steps.push (step, err)->
        console.log("Starting the first task")
        setTimeout(300, step.spawn())
        console.log("Starting the second task")
        setTimeout(600, step.spawn())
        #tasks are started immediately so you should call next to let the library know you are done spawning tasks
        step.next() 
    funcflow = require('funcflow')
    funcflow(steps, ()->console.log('we are done!'))
# Sharing state
___
Using an optional parameter, state can be passed to all the step functions

    steps = []
    steps.push (step, err)->
        step.sharedFunc(1)
        console.log(step.sharedString)
        step.sharedString = "step 1 has been here"
        setTimeout(300, step.next)
    steps.push (step, err)->
        step.sharedFunc(2)
        console.log(step.sharedString)
        setTimeout(300, step.next)
    sharedStateObject = {
        sharedString:"step 1 has not modified me"
        sharedFunc:(stepNum)->console.log("Starting Step " + stepNum)
    }
    funcflow = require('funcflow')
    funcflow(steps, sharedStateObject, ()->console.log('we are done!'))

The above code would output the following to the console

    Starting Step 1
    step 1 has not modified me
    Starting Step 2
    step 1 has been here
