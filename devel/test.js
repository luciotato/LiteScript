//test.js
/*
function props(a){
    var p = a;
    while (p.constructor!==Object) {
        console.log(p.constructor.name,":", Object.getOwnPropertyNames(p));
        p=p.__proto__
    }
}

try{
    fs = require('fs');
    var a = fs.readFileSync('Ctest');
    process.exit(1);
}
catch(err){

    var a=new Error('testERR');
    console.log(a.constructor);
    console.log(a.constructor.name);
    props(a);
    console.log(JSON.stringify(a));
    console.log(a.message);
    console.log(a);

    console.log(err.constructor);
    console.log(err.constructor.name);
    props(err);
    console.log(JSON.stringify(err));
    console.log(err);
    throw(err);
}
*/

    var path=require('path');
    console.log("OK");
    console.log( path.relative("/home/ltato","/home/ltato/LiteScript/devel"));
    console.log( path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb'));
    console.log("TEST");
    console.log( path.resolve("ltato"));
    console.log( path.resolve("home/ltato/LiteScript/devel").substr(1));
    console.log("FAIL");
    console.log( path.relative('/data/orandea/test/aaa', '/////data/orandea/impl/bbb'));
    console.log( path.relative("/home/ltato","/////home/ltato/LiteScript/devel"));
    console.log( path.relative('/data/orandea/test/aaa', '/////data/orandea/impl/bbb'));

