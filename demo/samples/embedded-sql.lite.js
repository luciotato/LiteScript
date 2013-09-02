var db = require('database')
var wait = require('wait.for'); //  http://github.com/luciotato/waitfor
var zlib = require('zlib');

/*
 NOTE: 'database' is a generic relational database access lib

 db.execute(query, params, callback) accepts:
     a parametrized sql statement
     its parameters
     and a callback(err,data)

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

//-----------------
function validateUser(username, hashpass)

    select id_socusua01 from soc_usua_01
        where socusua01_name = $username
        and socusua01_hashpass = $hashpass

    if no data then throw 'invalid username or password'

    return data.id_socusua01

end function

//---------------------------------
function respondWithToken(request, response)
    try
        case request.action

            when 'login'

                var tok=createToken(id_socusua01)

                //store session token
                insert into soc_usua_30 (rela_socusua01, socusua30_datetime, socusua30_token)
                     values ($request.id_socusua01, $(new Date().getTime()), $tok )

                respose.write(tok)

            when 'refresh' //token
                update soc_usua_30
                     set socusua30_datetime = $(new Date().getTime())
                     where socusua30_token = $request.token

                if data.rowsAffected is 0 then throw 'invalid token'

            when 'logout'
                delete from soc_usua_30
                     where socusua30_token = $request.token
        end case

    catch(err)
        response.end(502,err.message)

end function

//---------------------------------
function UserInfo_1(id_socusua01, response)
    try
        var su01 = select * from soc_usua_01 into su01
             where id_socusua01 = $id_socusua01

        var ed03 = select * from ent_dept_03
             join ent_dept_02 ed02 on id_entdept02 = rela_entdept02
             where ed02.rela_socusua01 = $su01.id_socusua01

        response.writeHead(200, {'Content-Type': 'gzip'})
        respose.end( wait.for(zlib.gzip,JSON.stringify(ed03))

    catch(err)
        response.end(502,err.message)

end function

