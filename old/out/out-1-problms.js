
'use strict';

var crypto = require('crypto');
 

function hash (pass, salt) {// pass: string, salt: string

    var h = crypto.createHash('sha512');
    h.update(pass);
    h.update(salt);
    return h.digest('base64');

} //end function

module.exports.getUser =function (email, password, callback) {

    db.execute("select socusua01_ID, socusua01_pass from soc_usua_01 where socusua01_email = ?"
            ,[email]
 

    //when done:
    ,function (err,data) {

        if (! data.rows ) {
            callback(null); //invalid email
            return;
        }


        var newHash = hash(password, email);

        if (data.socusua01_pass === newHash) { // ok email, pass

            callback( data.socusua01_ID ); //return user ID
        }

        else {

            callback(null); // invalid pass

        } //end if
    });// end when done:

} //end function

module.exports.addUser =function (email, password, callback) {

    var newHash = hash(password, email);


    try {

        db.execute("insert into soc_usua_01 (socusua01_email, socusua01_pass) values (?, ?)"
                    ,[email,newHash]
 

        //when done:
        ,function (err,data) {

            callback( null, data.new_id );
        });
    }

    catch(e) {

        if (e.message.indexOf( 'duplicated')!==-1) {

            callback ( e, 'email already used');
        }

        else {

            callback ( e, 'error');

        } //end if
    }// end catch(e)

} //end function
 
