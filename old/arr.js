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
    
        var src = leido.nextCode();
        lite.expect('into',newState);
        var dest = leido.nextCode();
        lite.expect('where',newState);
        
        leido.splice(0,leido.inx+1); //clear up-to here
        
        lite.sugar_BOOL_EXPRESION(newState, blockState); // process as boolean expression
        var boolExpr = leido.words;

        // set transformed line
        leido.words=[dest,'=',src,'.filter(function(item,index){return '].concat(boolExpr).push('});')
        
    } // end sugar FILTER
    
    function sugar_MAP() {
    
        lite.out(newState.indent,'//'+leido.line); //include as comment

        leido.trimComments();
        
        var src = leido.nextCode();
        lite.expect('into',newState);
        var dest = leido.slice(leido.inx+1).join(); //all the rest

        // set transformed line
        leido.words=[dest,'=',src,'.map'];

        //return and process sub-block
        newState.blockStarter = "(";
        newState.terminator = ")}";

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
