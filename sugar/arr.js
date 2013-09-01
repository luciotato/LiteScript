/*

    Lite-Array
    =============

    Extra-sugar, for array-like objects

    //--------------------
    //FILTER: - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    //--------------------
    
    Lite: -------------- using SQL sintax

        filter this.words into comments where item.isComment() and index>2;
        
    js: -----------------

        comments=this.words.filter(function(item,index){return item.isComment() && index>2});
    
    //--------------------
    //--MAP
    //--------------------
    
    Lite: -------------- 

        map this.words into comments 
            function(item,index)
                if index<2 then 
                    return item
                else
                    return '// comment $index is $item"
                end if
        
    js: -----------------

        comments = this.words.map(
            function(item,index){
                if (index<2) {
                    return item;
                } else {
                    return '// comment ' + index + " is " + item;
                }
            });
    
    */

function liteArrayLike(lite, newState, blockState) { // extra-sugar entry-point

    var leido = newState.leido; 

    //-- inner functions -----------------------------------
    function sugar_FILTER() {
    
        // filter wordsArr into comments where...
        var src = leido.nextCode();
        newState.expect('into');
        var dest = leido.nextCode();
        if (dest==='var') dest+=' '+leido.nextCode();
        newState.expect('where');
        
        // replace with: arr = origin.filter(function(item,index){return... 
        leido.replacePrevious(dest+' = '+src+'.filter(function(item,index){return');
        
        lite.sugar_BOOL_EXPRESION(newState, blockState); // after 'where', process as boolean expression
        
        leido.appendCode('});') // add terminators
        
    } // end sugar FILTER
    
    function sugar_MAP() {
    
        lite.out(newState.indent,'//'+leido.line); //include as comment

        leido.trimComments();
        
        var src = leido.nextCode();
        lite.expect('into',newState);
        var dest = leido.slice(leido.inx+1).join(); //all the rest

        // set transformed line
        leido.words=[dest,' = ',src+'.map'];
        
        newState.blockOpener = "(";
        newState.terminator = ")}";

        //return and process sub-block, usually a function

    } // end sugar FILTER

// -----------------------
// --liteArrayLike body
// -----------------------
    if (newState.keyword == 'filter') {
        sugar_FILTER();
    }
    else if (newState.keyword == 'map') {
        sugar_MAP();
    }
}



// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
//-- node or js:require
//-- exports
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
if (typeof module!=='undefined') { // inside 'require' or node module
    module.exports = liteArrayLike;
}
