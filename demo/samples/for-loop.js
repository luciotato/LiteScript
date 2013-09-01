// SAMPLE - For Loop sugar

function padLines(src,result) {

    for (var n=0 ; n <= src.length-1 ; n++) {
        if (src[n].indexOf( 'function')>=0 ) {
            result.push(src[n]); //add line
        }
    } //end for


undefined
    src.forEach(function(line,index){
        if (line.indexOf( 'function')>=0 ) {
            console.log("line " + index);
            result.push(line); //add line
        }
    }); //end for

} //end function
 

