var db = require('database')

/*
 NOTE: 'database' is a generic relational database access lib 
 
 db.execute(query, params, callback) accepts:
     a parametrized sql statement
     its parameters 
     and a callback
     
 db.execute automatically handles prepared statment caching.

// -----------------------
// db.execute PSEUDO-CODE:
// -----------------------
function db.execute(query, params, callback)  //callback=fn(err,data)
    var hashq = hash(query,'md5');
    var inx = this.prepared_cache.indexOf(hashq);
    if (inx>=0) {
        prepared = this.prepared_cache[inx];
    }
    else {
        prepared = this.driver.prepare_statement(query, params);
        this.prepared_cache[hashq]=prepared;
    }
    this.driver.execute_prepared_statement(prepared,params,callback);
end function
*/

//---------------------------------
function UserInfo_1(id_socusua01, response)

	sequential 

		 select * from soc_usua_01
			  where id_socusua01 = $id_socusua01

		 select * from ent_dept_03 
			  join ent_dept_02 on id_entdept02 = rela_entdept02
			  where rela_entdept01 = $id_entdept01

		 when done:(err,data)
			  if err then 
					response.error(502,e.message) 
			  else
					//no error
					gzip_start(data,...
					when done:(buf) 
						 response.writeHead(200, {'Content-Type': 'gzip'})
						 respose.end(buf) 

			  end if

end function

//---------------------------------
function selectDeptData(id_entdept01, response)

    select * from ent_dept_03 
        join ent_dept_02 on id_entdept02 = rela_entdept02
        where rela_entdept01 = $id_entdept01
        
    when done:(err,data)
        if err then 
            response.error(502,e.message) 
        else
            //no error
            gzip_start(data,...
            when done:(buf) 
                response.writeHead(200, {'Content-Type': 'gzip'})
                respose.end(buf) 
                
        end if

end function

//-----------------
function validateUser(username, hashpass, callback) 

    select id_socusua01 from soc_usua_01
        where socusua01_name = $username
        and socusua01_hashpass = $hashpass
    when done:
        if no data.rows then 
            callback(new Error('invalid username or password'))
        else
            callback(null, data.id_socusua01)
        end if
    
end function


//---------------------------------
function respondWithToken(id_socusua01, response)

    var tok=createToken(id_socusua01)

    insert into soc_usua_30 (rela_socusua01, socusua30_datetime, socusua30_token)
        values ($id_socusua01, $(new Date().getTime()), $tok )
    when done:
        if err then 
            response.error(502,e.message) 
        else
            //no error
            respose.end(tok) 
                
        end if
end function
    

//---------------------------------
function updateToken(tok, response)

    update soc_usua_30 
        set socusua30_datetime = $(new Date().getTime())
        where socusua30_token = $tok
        
    when done:
    
        if err then 
            response.error(502,e.message) 
        else
            //no error
            respose.end() 
        end if
        
end function

//---------------------------------
function deleteToken(tok, response)

    delete from soc_usua_30 
        where socusua30_token = $tok
        
    when done:
        case 
            when err        
                response.error(502,e.message) 
                
            when data.rowCount is 0 
                response.error(502,'invalid token') 
                
            else //ok
                respose.end() 
                
        end case

end function
