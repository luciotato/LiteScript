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

    //-- inner function -----------------------------------
    function sugar_SQL() {

	 var intoVar;
	 if (leido.code ==='into') { // next is a variable name to hold results
		intoVar= leido.nextCode();
		leido = lite.readNext(); //next line
	 };
		
        var comments = newState.appendSubBlock(); //append sub-block words into leido.words - trim comments
    
	 var codeAutoCallback = (intoVar || blockState.sequential);
	 
	 if  (!codeAutoCallback) {
		var whenDoneItem = lite.peekNextItem();
		if (!whenDoneItem.line.startsWith('when done:')) { newState.err("expected 'when done:' block after sql command. (missing 'sequential' keyword?)"); return; }
	 }
        // split $x references in words[]
        var spl=newState.split$expressions();
        
        // create parametrized db.execute 
        var parameters=[];
        var arrResult=['db.execute(','"']; //construct js statement
        
        spl.items.forEach( //for esach $expression
            function(item,index){
                arrResult.push(item.pre,'?'); //replace $x --> ?
                parameters.push(item.expr); //parameters for the ?
            }
        );
        arrResult.push(spl.post,'"'); // close query string
        
        //out comments
        if(comments.length){
            leido.words = comments;
            lite.out(leido);
        }

        //replace read line with db.execute call
        leido.words = arrResult;
        lite.out(leido);

        // return last section, "bind parameters", as original line translation
        leido.words = ['    ',',[', parameters.toString(), ']',','];

        // return and continue processing 'when done:' block
	if (codeAutoCallback) {
		leido.words.push('function(err,data) { ');
		lite.out(leido);
		newState.blockIndent+=4;
		newState.out('if(err)throw err;');
		if(intoVar) newState.out('intoVar=data;');
		newState.blockIndent-=4;
		newState.out('});');
		leido.words = [];
		}
		
    } // end inner function

// -----------------------
// --liteSQL body
// -----------------------
    if (["select","insert","update","delete"].indexOf(leido.code)>=0) {
        sugar_SQL();
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
