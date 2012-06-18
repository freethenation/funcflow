{exec} = require 'child_process'

task 'build', 'Compiles src/flow.coffee to lib/flow.js', ->
  compile()

task 'build:watch', 'watches src/flow.coffee and rebuilds when a change is detected', ->
  watch()

task 'build:min', 'Compiles src/flow.coffee to lib/flow.js and then runs UglifyJS on it', ->
    compile()
    compress()

watch = (callback) ->
  exec 'coffee -w -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled coffee files"
    callback?()

compile = (callback) ->
  exec 'coffee -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled coffee files"
    callback?()

compress = (callback) ->
  exec 'uglifyjs --overwrite lib/flow.js', (err, stdout, stderr) ->
    throw err if err
    console.log "Compressed flow.js"
    callback?()

