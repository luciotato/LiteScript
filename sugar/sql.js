/*

    Lite-SQL
    =============

    Extra-sugar, embedded SQL

    relies on:
        db object
        db.execute(sql,params)

    Lite: ------------------

    select id_socusua01 into w_su01
        from soc_usua_01
        where socusua01_nombre = $cmdObj.user
        and socusua01_clave = $cmdObj.pwd

    when done:

        insert into soc_usua_30 (socusua30_datetime, socusua30_token, rela_socusua01)
            values ( $(new Date().getTime()), $tok, $w_su01.id_socusua01)

        when done:

            update soc_usua_40
                set socusua40_datetime = $(new Date().getTime()), rela_socusua30 = $sql.new_id
                where socusua40_username = $cmdObj.user

    js: -------------------

    this.sql = {};

    db.execute("select id_socusua01 from soc_usua_01 where socusua01_nombre = ? and socusua01_clave = ?"
        ,[cmdObj.user,cmdObj.pwd]

        , function(err,data){ //when done:

            if (err) throw(err);

            w_su01 = data;

            db.execute("insert into soc_usua_30 (socusua30_datetime, socusua30_token, rela_socusua01) values (?,?,?)"
                , [ new Date().getTime(),  tok, w_su01.id_socusua01]

                , function(err,data){ //when done:

                    if (err) throw(err);

                    this.sql = data; //rows inserted, new id

                    db.execute("update soc_usua_40 set socusua40_datetime=?,rela_socusua30 = ? where where socusua40_username = ?"
                        , [ new Date().getTime(), sql.new_id, cmdObj.user]

                        , function(err,data){ //when done:

                            if (err) throw(err);

                            this.sql = data;

                        }
                    );
                }
            );

        }
    );
    }
    */

    /*
    // NOTE: sql parametrized execute with auto prepared statment caching.
    // We assume 'db' generic driver hashs text and use prepared statements if cached
    //
    // EXPECTED db.execute PSEUDO-CODE:
    // --------------------------------
    function db.execute ( query, params, callback )
        hashq = hash(query,'md5');
        inx = cache.indexOf(hashq);
        if (inx>=0) {
            prepared = prepared_cache[inx];
        }
        else {
            prepared = drive.prepare_statement(query, params);
            prepared_cache[hashq]=prepared;
        }
        driver.execute_prepared_statement(prepared.name,params,callback);
    end function

    */


function liteSQL(lite, newState, blockState) { // extra-sugar entry-point

    var leido = newState.leido;

    //-- inner function ------
    function sugar_SQL(prefix) {

        prefix = prefix||"var data ="; //default 

        blockState.out( prefix + " wait.forMethod(db,'execute'");
        blockState.blockIndent+=4;

        var lineIndex=0,comments,lineWithParams;
        var parameters=[];
        // process SQL lines
        var line=leido;
        while(true){
            comments = line.trimComments(); //trim & return comments
            // replace $var for ?, and remember var
            var spl=split$expressions(line.words.join(''), blockState.err);
            lineWithParams="";
            spl.items.forEach( //for each $expression
                function(item){
                    lineWithParams += item.pre + '?';
                    parameters.push(item.expr); //parameters for the ?
                 }
            );
            // save line
            blockState.out( (lineIndex===0?',"':'+" ') + lineWithParams + spl.post + '" ' + comments );
            if (lite.peekNextItem().indent <= leido.indent)
                break;// end of indented block

            line = lite.readNextLine(); //next block line
            lineIndex++;
        }
        // return last section, "bind parameters", as the original line translation
        leido.words = ['    ,[', parameters.toString(), ']',');'];
        blockState.blockIndent-=4;

    } // end inner function

    function isSql(word){
        return ["into","select","insert","update","delete"].indexOf(word)>=0;
    }

// -----------------------
// --liteSQL body
// -----------------------
    var varname;

        if (isSql(leido.token)) {
            sugar_SQL();
        }
        else {
            // get (possible) varname
            if (leido.token==='var')
                varname = leido.nextToken();
            else
                 varname = leido.token;

            if (leido.nextToken()==='=' && isSql(leido.nextToken())) {
                // [var] data = select ...
                leido.words.splice(0,leido.inx); //remove
                sugar_SQL('var '+varname + ' =');
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
    module.exports = liteSQL;
}
