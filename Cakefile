{exec} = require 'child_process'

task 'build', 'compiles src/funcflow.coffee to lib/funcflow.js', ->
  compile()

task 'build:watch', 'watches src/funcflow.coffee and rebuilds when a change is detected', ->
  watch()

task 'build:min', 'compiles src/funcflow.coffee to lib/funcflow.js and then runs UglifyJS on it', ->
    compile(()=>compress())

watch = (callback) ->
  exec 'coffee -w -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled funcflow.coffee"
    callback?()

compile = (callback) ->
  exec 'coffee -o lib/ -c src/', (err, stdout, stderr) ->
    throw err if err
    console.log "Compiled funcflow.coffee"
    callback?()

compress = (callback) ->
  exec 'uglifyjs -o lib/funcflow.min.js lib/funcflow.js', (err, stdout, stderr) ->
    throw err if err
    console.log "Compressed funcflow.js"
    callback?()

