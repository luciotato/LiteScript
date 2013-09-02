//------------
// GLOBAL
// -----------
var MainLite_ed;
var CompareLite_ed;
var CompareJs_ed;

var sourcePadded=[];
var sourcePadded_onSrceIndex=0;

var lite = new Lite();

//------------
// MAIN
// -----------
function OnLine_Main(){

    lite.addSugar(liteSQL); //add embeddeb SQL sugar
    lite.addSugar(liteArrayLike); //add array-like map filter sugar

    CompareLite_ed = mkEditor("Compare-Lite");
    CompareJs_ed = mkEditor("Compare-js");
    loadSample('embedded-sql');
}

function loadFile(fname, callback) {

//    syncEditors([CompareLite_ed, CompareJs_ed],false);

    CompareJs_ed.setValue("");

    CompareLite_ed.setValue("Loading...");
    CompareLite_ed.resize(true);

    var fileName = 'demo/samples/'+fname+'.lite.js';
    document.getElementById('status').textContent=fileName;
    httpGet(fileName
        ,function(err,data){
            if (err && !data) data=err.toString();
            data = data.replace('\r',''); // remove CR from windows-edited files

            CompareLite_ed.setValue(data);

            CompareLite_ed.clearSelection();
            CompareLite_ed.scrollToLine(0);

            if (callback) callback(err);
        }
    );
}

function loadSample(fname) {
    loadFile(fname, function(err){ if (!err) run();} );
}

function mkEditor(divName){

    var editor = ace.edit(divName);
    editor.setTheme("ace/theme/monokai");
    editor.setShowPrintMargin(false);
    editor.setFontSize(16);
    editor.addLines=addLines; //function addLines(lineArray)
    var session = editor.getSession();
    session.setUseWorker(false);
    session.setMode("ace/mode/javascript");
    return editor;
}

// ace.editor.prototype.addLines
function addLines(lineArray){

    if (!lineArray) return;

    if ( typeof lineArray === 'string' ) {
        var a=[];
        a[0]=lineArray;
        lineArray=a;
        }

    //console.log(lineArray);
    this.session.doc.insertLines(this.session.doc.getLength()-1, lineArray);
    this.resize(true);
}


function syncEditors(aceEditors,onOff){
// Sync side-by-side ace editors scrolling
// from http://codepen.io/ByScripts/pen/fzucK

    for(var n=0;n<aceEditors.length;n++){
        var session1 = aceEditors[n].session;
        if (onOff===false){ //disconnect
            session1.removeAllListeners('changeScrollTop');
            session1.removeAllListeners('changeScrollLeft');
        }
        else { //connect

            var session2 = aceEditors[n==aceEditors.length-1?0:n+1].session;

            session1.on('changeScrollTop',
              function(scroll) {
                session2.setScrollTop(parseInt(scroll) || 0)
              }
            );
            /*session1.on('changeScrollLeft',
              function(scroll) {
                session2.setScrollLeft(parseInt(scroll) || 0)
              }
            );
*/
            session2.on('changeScrollTop',
              function(scroll) {
                session1.setScrollTop(parseInt(scroll) || 0)
              }
            );
/*            session2.on('changeScrollLeft',
              function(scroll) {
                session1.setScrollLeft(parseInt(scroll) || 0)
              }
            );
*/
        }
    }
};


function addRun(liteLines,jsLines){
    if (typeof liteLines != 'string') {
        // assure same number of lines in both arrays, to make comparision easier
        var n;
        for(n=liteLines.length;n<jsLines.length;n++) liteLines[n]="";
        for(n=jsLines.length;n<liteLines.length;n++) jsLines[n]="";
    }
    // add lines
    CompareLite_ed.addLines(liteLines)
    CompareJs_ed.addLines(jsLines);
}

function Online_advanceHook(){

    // keep a "padded Source" to match lines on result
    // add lines to result if needed
    //var n;

    var srcePos = lite.pos.originalSource_lineIndex+1;

    //copy source on sourcePadded (up to current processing position)
    while (sourcePadded_onSrceIndex<srcePos)
        sourcePadded.push(lite.sourceLines[sourcePadded_onSrceIndex++]);

    while (sourcePadded.length < lite.result.length) {
        sourcePadded.push(""); //add line - nbsp
      //  if (lite.sourceLines[sourcePadded_onSrceIndex]==="") { //ya estaba agregada en el source
      //      sourcePadded_onSrceIndex++; //no la agrego de nuevo en la proxima
      //  }
    }

    while (lite.result.length < sourcePadded.length) {
        lite.result.push(""); //add line to result
    }

    /*
    while (sourcePadded.length < lite.result.length) {
        sourcePadded.push(" "); //add line
    }
    while (lite.result.length < sourcePadded.length) {
        lite.result.push(" "); //add line
    }
    */

    null;

    //for(n=lite.sourceLines.length;n<result.length;n++) lite.sourceLines.push("");
    //for(n=result.length;n<lite.sourceLines.length;n++) result.push("")

    //document.title = "line " + pos.SourceLinesIndex;

    /*var stat=$("#status");
    stat.parent().hide();
    stat.html();
    stat.parent().show();
    */

    /*
    addRun( lite.sourceLines.slice(lite.SourceLinesIndex,pos.SourceLinesIndex+1)
           ,result.slice(lite.prevResultIndex,result.length));

    lite.SourceLinesIndex = pos.SourceLinesIndex+1;
    lite.prevResultIndex = result.length;
    */

}

function run() {

//    try{

        var OriginalSource=CompareLite_ed.session.getValue();

        //clear
        //syncEditors([CompareLite_ed, CompareJs_ed], false); //un-sync
        //CompareLite_ed.setValue("");
        CompareLite_ed.resize(true);
        //CompareJs_ed.setValue("");
        //CompareJs_ed.resize(true);

        //$('#run-rows').html('<tr class=headers>'
        //        +'<td>Lite code</td><td width="20px"></td><td>js code</td>');

        sourcePadded=[];
        sourcePadded_onSrceIndex=0;

        lite.advanceHook = Online_advanceHook;

        lite.process(OriginalSource);

        /*CompareLite_ed.setValue(MainLite_ed.getValue());
        CompareLite_ed.resize(true);
        CompareJs_ed.setValue(lite.result.join('\n'));
        CompareJs_ed.resize(true);
        */

        addRun( '','' ); //extra line, to ease scrolling to the end

        var n;
        for(n=sourcePadded.length;n<lite.result.length;n++) sourcePadded.push("");
        for(n=lite.result.length;n<sourcePadded.length;n++) lite.result.push("");

        CompareLite_ed.setValue(null);
        addLines.call ( CompareLite_ed, sourcePadded );

        CompareJs_ed.setValue(null);
        addLines.call ( CompareJs_ed, lite.result );

        CompareLite_ed.clearSelection();
        CompareJs_ed.clearSelection();

        //sync eds
        syncEditors([CompareLite_ed, CompareJs_ed]);

        CompareLite_ed.scrollToLine(0);

//    }catch(ex){
//        console.trace();
//        addRun("ERR: " + ex.message);
//    }
}

