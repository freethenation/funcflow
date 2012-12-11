fs = require 'fs'

task 'build', 'compiles src/funcflow.coffee to lib/funcflow.js', ->
    readFile('./src/funcflow.coffee', (file)->compile(file, (file)->writeFile('./lib/funcflow.js', file, ()->console.log('Compiled "funcflow.js"!'))))

task 'build:min', 'compiles src/funcflow.coffee to lib/funcflow.js and then runs UglifyJS on it', ->
    invoke('build')
    setTimeout((()->readFile('./lib/funcflow.js', (file)->compress(file, (file)->writeFile('./lib/funcflow.min.js',  file, ()->console.log('Compiled "funcflow.min.js"!'))))), 1500)

task 'build:full', 'compiles src/funcflow.coffee, runs all tests, and minifies', ->
    invoke('build:min')
    setTimeout((()->invoke('test')), 3000)
    
task 'test', 'compiles src/funcflow.coffee and then runs tests on it', ->
    invoke('build')
    setTimeout(
        (()->readFile('./tests/tests.coffee', (file)->compile(file, (file)->writeFile('./tests/tests.js', file, ()->test('./tests/tests.js', ()->console.log('Tested "funcflow.coffee" successful!')))))),
        1500)
    
compile = (inputFile, callback) ->
    coffee = require 'coffee-script'
    callback?(coffee.compile(inputFile))

compress = (inputFile, callback) ->
    uglify = require "uglify-js"
    ast = uglify.parser.parse(inputFile); # parse code and get the initial AST
    ast = uglify.uglify.ast_mangle(ast); # get a new AST with mangled names
    ast = uglify.uglify.ast_squeeze(ast); # get an AST with compression optimizations
    callback?(uglify.uglify.gen_code(ast))
    
 readFile = (filename, callback) ->
    data = fs.readFile(filename, 'utf8', (err, data)-> if err then throw err else callback(data))
 
 writeFile = (filename, data, callback) ->
     fs.writeFile(filename, data, 'utf8', (err)-> if err then throw err else callback())

#'nodeunit tests/tests.js',
     
test = (inputFile, callback) ->
    console.log 'Testing "funcflow.coffee"'
    tests = require("./tests/tests.js")
    tests.RunAll()
    callback()