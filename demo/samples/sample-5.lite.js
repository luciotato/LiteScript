var fs=require('fs')
var path=require('path')

// LiteScript Processor

var sourcePath=path.resolve(__dirname,'src')

var destPath=path.resolve(__dirname,'out')

if not fs.existsSync(destPath) then fs.mkdirSync(destpath)

var source =
    lines:[]
    lineIndex:0
    ident:0
    lastIdent:0

var result=[]

var States
    INITIAL:0
    INSIDE_IF:1
    INSIDE_CASE:2
    INSIDE_CASE_BOOLEAN:3
    EOF:4


// -----------------
// ---Start --
// -----------------
function Start

    console.log('Reading Files...')
    fs.readdir(sourcePath, ProcessFiles)

end function
