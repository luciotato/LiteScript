'use strict';

var child_process = require('child_process'); //to invoke gzip


//-----------------
function start_gzip(obj, callback) 

    var gzip_process = child_process.spawn('gzip')
    
    var compressed_chunks=[]
    
    gzip_process.stdin.write(JSON.stringify(obj));
    
    on gzip_d.stdout 'data'
        function(data)
            compressed_chunks.push(data);

    on gzip_d 'exit'
        function(code) 
            if code <> 0 
                callback(new Error("gzip exit code: $code"))
            else
                callback(null, Buffer.concat(compressed_chunks));
        
end function


//-----------------
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
            
            on session1 'changeScrollLeft'
              function(scroll) 
                session2.setScrollLeft(parseInt(scroll) || 0)

            on session2 'changeScrollTop'
              function(scroll) 
                session1.setScrollTop(parseInt(scroll) || 0)

            on session2 'changeScrollLeft'
              function(scroll) 
                session1.setScrollLeft(parseInt(scroll) || 0)

        end if
        
end function

