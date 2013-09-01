//------------
// GLOBAL
// -----------
var MainLite_ed
var CompareLite_ed
var CompareJs_ed

var sourcePadded=[]
var sourcePadded_onSrceIndex=0

var lite = new Lite()

//------------
// MAIN
// -----------
function OnLine_Main

    lite.addSugar(liteSQL) //add embeddeb SQL

    CompareLite_ed = mkEditor("Compare-Lite")
    CompareJs_ed = mkEditor("Compare-js")
    loadFile ('sample-1')


function loadFile(fname, callback) 

//    syncEditors([CompareLite_ed, CompareJs_ed],false);

    CompareJs_ed.setValue("")

    CompareLite_ed.setValue("Loading...")
    CompareLite_ed.resize(true)

    httpGet('samples/'+fname+'.lite.js',...
        when done:
            data = data.replace('\r','') // remove CR from windows-edited files
        
            CompareLite_ed.setValue(data)
        
            CompareLite_ed.clearSelection()
            CompareLite_ed.scrollToLine(0)
            
            if (callback) callback()

end function


function loadSample(fname) 
    loadFile(fname, Run)


function mkEditor(divName)

    var editor = ace.edit(divName)
    editor.setTheme("ace/theme/monokai")
    editor.setShowPrintMargin(false)
    editor.setFontSize(16)
    editor.addLines=addLines //function addLines(lineArray)
    var session = editor.getSession()
    session.setUseWorker(false)
    session.setMode("ace/mode/javascript")
    return editor

end function


// ace.editor.prototype.addLines
function addLines(lineArray)

    if no lineArray return

    if lineArray is string //called with a string as parameter
        var a=[]
        a[0]=lineArray
        lineArray=a
    end if

    //console.log(lineArray);
    this.session.doc.insertLines(this.session.doc.getLength(), lineArray)
    this.resize(true)
}


function syncEditors(aceEditors,onOff)
// Sync side-by-side ace editors scrolling
// from http://codepen.io/ByScripts/pen/fzucK

    for var n=0 to aceEditors.length
    
        var session1 = aceEditors[n].session

        if onOff is false //disconnect
            session1.removeAllListeners('changeScrollTop')
            session1.removeAllListeners('changeScrollLeft')
        
        else  //connect

            var session2 = aceEditors[ n+1===aceEditors.length? 0 : n+1 ].session

            on session1 'changeScrollTop'
              function(scroll) 
                session2.setScrollTop(parseInt(scroll) || 0)
            
/*            on session1 'changeScrollLeft'
              function(scroll) 
                session2.setScrollLeft(parseInt(scroll) || 0)
*/
            on session2 'changeScrollTop'
              function(scroll) 
                session1.setScrollTop(parseInt(scroll) || 0)

/*            on session2 'changeScrollLeft'
              function(scroll) 
                session1.setScrollLeft(parseInt(scroll) || 0)
*/
        end if
        
end function


function addRun(liteLines,jsLines)

    if liteLines is 'Array'
        // assure same number of lines in both arrays, to make comparision easier
        var n;
        
        for n=liteLines.length to jsLines.length
            liteLines[n]=""
        end for
        
        for n=jsLines.length to liteLines.length
            jsLines[n]=""
        end for
    
    end if
    
    // add lines
    CompareLite_ed.addLines(liteLines)
    CompareJs_ed.addLines(jsLines)
}

function Online_advanceHook

    // keep a "padded Source" to match lines on result
    // add lines to result if needed
    //var n;
    
    var srcePos = lite.pos.originalSource_lineIndex+1

    //copy source on sourcePadded (up to current processing position)
    while sourcePadded_onSrceIndex < srcePos
        sourcePadded.push(lite.sourceLines[sourcePadded_onSrceIndex++])
    
    while sourcePadded.length < lite.result.length
        sourcePadded.push(" ") //add line
    
    while lite.result.length < sourcePadded.length
        lite.result.push(" ") //add line
    
}

function Run() {

    try

        var OriginalSource=CompareLite_ed.session.getValue()

        CompareLite_ed.resize(true)

        sourcePadded=[];
        sourcePadded_onSrceIndex=0

        lite.advanceHook = Online_advanceHook

        lite.process(OriginalSource)

        addRun( '','' ) //extra line, to ease scrolling to the end

        CompareLite_ed.setValue("")
        addLines.call ( CompareLite_ed, sourcePadded )
    
        CompareJs_ed.setValue("")
        addLines.call ( CompareJs_ed, lite.result )

        CompareLite_ed.clearSelection()
        CompareJs_ed.clearSelection()
        
        //sync eds
        syncEditors([CompareLite_ed, CompareJs_ed])

        CompareLite_ed.scrollToLine(0)

    catch(ex)
        console.trace();
        addRun("ERR: " + ex.message);

end function 
