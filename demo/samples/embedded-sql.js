var db = require('database');

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
function UserInfo_1(id_socusua01, response) {

    sequential {

---------------------------------------------------
!!! ERROR: expected 'when done:' block after sql command. (missing 'sequential' keyword?)
source line 34:
         select * from soc_usua_01
---------------------------------------------------
         select * from soc_usua_01 where id_socusua01 = $id_socusua01;

         db.execute("select * from ent_dept_03 join ent_dept_02 on id_entdept02 = rela_entdept02 where rela_entdept01 = ?"
             ,[id_entdept01],

         //when done:(err,data)
         function (err,data) {
              if (err ) {
                    response.error(502,e.message);
              }
              else {
                    //no error
                    gzip_start(data,
                    //when done:(buf)
                    function (buf) {
                         response.writeHead(200, {'Content-Type': 'gzip'});
                         respose.end(buf);
                    });

              } //end if
         });// end when done:(err,data)
    }// end sequential

} //end function

//---------------------------------
function selectDeptData(id_entdept01, response) {

    db.execute("select * from ent_dept_03 join ent_dept_02 on id_entdept02 = rela_entdept02 where rela_entdept01 = ?"
        ,[id_entdept01],

    //when done:(err,data)
    function (err,data) {
        if (err ) {
            response.error(502,e.message);
        }
        else {
            //no error
            gzip_start(data,
            //when done:(buf)
            function (buf) {
                response.writeHead(200, {'Content-Type': 'gzip'});
                respose.end(buf);
            });

        } //end if
    });// end when done:(err,data)

} //end function

//-----------------
function validateUser(username, hashpass, callback) {

    db.execute("select id_socusua01 from soc_usua_01 where socusua01_name = ? and socusua01_hashpass = ?"
        ,[username,hashpass],
    //when done:
    function (err,data) {
        if (! data.rows ) {
            callback(new Error('invalid username or password'));
        }
        else {
            callback(null, data.id_socusua01);
        } //end if
    });// end when done:

} //end function


//---------------------------------
function respondWithToken(id_socusua01, response) {

    var tok=createToken(id_socusua01);

    db.execute("insert into soc_usua_30 (rela_socusua01, socusua30_datetime, socusua30_token) values (?, ?, ? )"
        ,[id_socusua01,new Date().getTime(),tok],
    //when done:
    function (err,data) {
        if (err ) {
            response.error(502,e.message);
        }
        else {
            //no error
            respose.end(tok);

        } //end if
    });// end when done:
} //end function


//---------------------------------
function updateToken(tok, response) {

    db.execute("update soc_usua_30 set socusua30_datetime = ? where socusua30_token = ?"
        ,[new Date().getTime(),tok],

    //when done:
    function (err,data) {

        if (err ) {
            response.error(502,e.message);
        }
        else {
            //no error
            respose.end();
        } //end if
    });// end when done:

} //end function

//---------------------------------
function deleteToken(tok, response) {

    db.execute("delete from soc_usua_30 where socusua30_token = ?"
        ,[tok],

    //when done:
    function (err,data) {
         {// case
            if (err) {
                response.error(502,e.message)
            }

            else if (data.rowCount === 0) {
                response.error(502,'invalid token');
            }

            else { //ok
                respose.end();
            }

        } //end case
    });// end when done:

} //end function
 
