{exec} = require 'child_process'

task 'build', 'compiles src/flow.coffee to lib/flow.js', ->
  compile()

task 'build:watch', 'watches src/flow.coffee and rebuilds when a change is detected', ->
  watch()

task 'build:min', 'compiles src/flow.coffee to lib/flow.js and then runs UglifyJS on it', ->
    compile(()=>compress())

watch = (callback) ->
  exec 'coffee -w -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled flow.coffee"
    callback?()

compile = (callback) ->
  exec 'coffee -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled flow.coffee"
    callback?()

compress = (callback) ->
  exec 'uglifyjs -o lib/flow.min.js lib/flow.js', (err, stdout, stderr) ->
    throw err if err
    console.log "Compressed flow.js"
    callback?()

