// Module dependencies.
var http = require("http")
var url = require("url")
var path = require("path")
var fs = require("fs")
var util = require('util')

var spawn = require('child_process').spawn; //para invocar Zip/unzip

//Global var app, contiene todas las vars de la app
var app =
    db_module : require('db_conn')
    web_server : require('web_server_minimo')

console.log('nodejs version: ' + process.version);

//COUCH DB: var conn = dataserver.createConn('escribanos', {driver:'couch',protocol:'https','host:luciotato.cloudant.com',auth:'luciotato:fritas013273'});

// POSTGRESQL
//global.pg_log = true; // console log de lo que hace el driver pg
/*
app.conn = app.db_module.createConn('escribanos'
    , {driver:'postgresql'
        ,host:'199.167.31.198'
        ,user:'ltato'
        ,password:'base'
        }
    );
*/
// START LISTENING
app.web_server.StartServer( routes_fn, 80 );
//--------------------------------------------------

//
// Main Routing
//
function routes_fn(url_parts, request, response) 

    // url_parts: ver http://nodejs.org/docs/latest/api/url.html
    // url_parts.query: ver http://nodejs.org/api/querystring.html

    try 
    
        switch (url_parts.pathname) {
            
            case '/': 
            /*
            d) para GET / (root) el web server retorna:
                web/layout/top.html: tiene el <header> con los js.base, un <div id=index_top> y un <div id=central>
                web/xxx.html: (contenido para <div id=center>)
                web/layout/bottom.html: tiene un <div id=index_bottom> y dentro un <div id=status> para mostrar status y <div id=err> para mostrar errores
            */
            response.writeFileContents('layout/atop.html');
            response.writeFileContents('index.html');
            response.writeFileContents('layout/bottom.html');
            response.end();
            return true; //handled
            
            // POST /s(erver) data=binary
            case '/s': //?q=select * from dual
                
                if (request.method!='POST') throw new Error('!POST /s - method should be POST');
                
                app.web_server.receivePostRequestData(request,response, 
                when done:
                    if (err) throw(err);
                    processPackage(data);
                
                return true; //handled
    
            // GET /dataserver
            case '/dataserver': //?q=select * from dual
                
                if (!url_parts.query.q) throw new Error('GET /dataserver?q=null: param is null.');
                
                app.conn.execute(url_parts.query.q, 
                when done:
                    if (err) 
                        response.error(500,err.message); //respondo con el error
                     else 
                        response.end(JSON.stringify(data));
                    
                return true; //handled
    
            // GET /node_modules -- ejecucion de un modulo de node.js
            case '/node_modules': case "/call":  //?js=filename
    
                if (!url_parts.query.js) throw new Error('GET /node_modules?js=null: param is null.');
                var module_js=require(url_parts.query.js); //"require" carga file.js, lo compila y ejecuta
                return module_js.handle(app, url_parts, request, response); 
                    // el module debe exportar function handle(app, url_parts, request, response)
                    // y retornar "false" si quiere que el request lo maneje el static server
    
    
            case '/do': //?cmd=command
                switch(url_parts.query.cmd){
                    case "ls":
                        var wd=path.join(process.cwd(),'/../');
                        console.log ("cmd=ls -> fs.readdir ",wd);
                        
                        fs.readdir(wd,...
                        when done:(err,files)
                            if err
                                response.end(err.message)
                            else 
                                filter files into var onlyFiles where item[0] is not '.'
                                response.end(JSON.stringify(onlyFiles));
                            end if
                                
                        return true;
                        
                    default:
                        response.end("invalid command " & url_parts.query.cmd);
                }
                break;
    
            default: 
                return false; // no manejado, que busque un static file
        }
    
    catch(ex)
    
        response.error(404,ex.message); //respondo con el error
        return true;
    

end function


//-----------------
function processPackage(data, response) 

    var gzip_d = spawn('gzip',['-d'])
    var uncompress_chunks=[]
    
    on gzip_d 'exit'
        function(code) 
            if (code!==0) throw(new Error('gzip -d exit code='+code));
            processCommand(JSON.parse(uncompress_chunks.join('')) ,response);
        
    on gzip_d.stdout 'data'
        function(data) 
            uncompress_chunks.push(data);

end function

//-----------------
function gzip(obj, callback) 
    var gzip_process = spawn('gzip')
    var compressed_chunks=[]
    
    gzip_process.stdin.write(JSON.stringify(obj));
    
    on gzip_d 'exit'
        function(code) 
            if (code!==0) throw(new Error('gzip exit code='+code));
            callback(null, Buffer.concat(compressed_chunks));
        
    on gzip_d.stdout 'data'
        function(data)
            compressed_chunks.push(data);

end function

//-----------------
function processCommand(cmdObj, response) 

    case cmdObj.fnindex
    
        when 1 then // login
    
            select id_socusua01 from soc_usua_01
                where socusua01_nombre = $cmdObj.user
                and socusua01_clave = $cmdObj.pwd
            when done:
                if no data.rows then 
                    response.error(505,'invalid user or password') 
                end if
                
                // inserto en la tabla de usuarios autorizados, un token de login
                insertToken(response)

        else
            response.error(500,'invalid function index')
            
    end case
    
end function

function insertToken(response)
    response.count=response.count+1||0;
    var tok = generateRandomToken()
    insert into soc_usua_30 (socusua30_datetime, socusua30_token, rela_socusua01)
        values ( $(new Date().getTime()), $tok, $w_su01.id_socusua01)
    when done:
        if err then 
            if response.count<10 and err.message contains 'duplicated' then 
                //token duplicated, re-try
                insertToken(response)
            else
                response.error(502,e.message) // another error or more than 10 retries
            end if
        else
            //no error
            response.writeHead(200, {'Content-Type': 'gzip'})
            
            gzip({tok:token},...
            when done:(buf) 
                respose.end(buf) 
                
        end if
end function
    
//---------------------------------
function generateRandomToken 
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for var x = 0 to 16
    var i = Math.floor( Math.random() * 62 )
    token += chars.charAt( i )
  }
  return token
end function


/*
var zip = spawn('zip');
zip.on('exit', function(code) {
    // Do something with zipfile archive.zip
    // which will be in same location as file/folder given
    });
zip.stdout.on('data', function(data) {

});

}
*/

// -------------------------------------
// ------- TEST DATA BASE QUERY --------
// -------------------------------------
//conn.LoadData("insert into proc.pro_mdl_01(promdl01_json) values ('{un:1,objeto:2,json:3}')"
//    , cb_debugShow);
/*
    app.conn.execute("select * from proc.pro_mdl_01 LIMIT 5"
        ,cb_debugShow
        );
    
    //callback debug Show
    function cb_debugShow(err,data){ 
        console.log("TEST: %s",this.text);
        console.log("TEST: err code: %s",err);
        console.log("TEST: util.inspect(data): %s",util.inspect(data));
        //console.log("JSON.stringify(data): %s",JSON.stringify(data));
        }
*/
// --------END TEST-----------
// ---------------------------

