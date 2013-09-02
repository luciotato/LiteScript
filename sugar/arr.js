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
    function sugar_MAP(prefix) {

        prefix = prefix ||'var data';

        leido.trimComments();

        var src = leido.nextToken();
        // replace with: src.map(
        leido.replacePrevious(prefix+' = '+src+'.map(');

        newState.blockStarter = "(";
        newState.terminator = ");";

        //return and process sub-block, usually a function

    } // end sugar MAP

    function sugar_FILTER(prefix) {

        prefix = prefix ||'var data';
        // filter wordsArr into comments where...
        var src = leido.nextToken();

        // replace with: src.filter(function(item,index){return...
        leido.replacePrevious(prefix+' = '+src+'.filter(function(item,index){return');

        if (!leido.readNextToken()) { // let's assume 'where' is in the next line
            lite.out(leido);
            newState.leido = leido = lite.readNextLine();//next line
        } 
        leido.inx--; //step back
        
        newState.expect('where'); 
        var whereInx=leido.inx;        
        
        if (leido.lastCode()===';') leido.replaceWith(''); //remove last ; if it is there

        leido.inx = whereInx;
        newState.out('//'+leido.line); //include as comment
        leido.replaceWith('');
        lite.sugar_BOOL_EXPRESION(newState, blockState); // after 'where', process as boolean expression

        leido.appendCode('});') // add terminators

    } // end sugar FILTER

// -----------------------
// --liteArrayLike body
// -----------------------
    
    if (leido.token === 'map') {
        sugar_MAP();
    }
    else if (leido.token === 'filter') {
        sugar_FILTER();
    }
    else {
        // get (possible) varname
        if (leido.token==='var') {
            varname = 'var '+leido.nextToken();
        } 
        else {
            varname = leido.token;
        }
        if (leido.nextToken()==='='){
            leido.nextToken();
            if (leido.token==='map') {
                // [var] data = map ...
                sugar_MAP(varname);
            }
            else if (leido.token==='filter') {
                // [var] data =filter ...
                sugar_FILTER(varname);
            }
        }
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
