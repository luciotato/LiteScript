//Compiled by LiteScript compiler v0.6.3, source: test-v0.6/sourceMap/sourceMapTest.lite.md

   //import expect
   var expect = require('./expect');

   //import SourceMap
   var SourceMap = require('./SourceMap');


   var vlqEncodedValues = [[1, "C"], [-1, "D"], [2, "E"], [-2, "F"], [0, "A"], [16, "gB"], [948, "o7B"]];

   //for each pair in vlqEncodedValues
   for( var pair__inx=0,pair ; pair__inx<vlqEncodedValues.length ; pair__inx++){pair=vlqEncodedValues[pair__inx];
     expect("encodeVlq", SourceMap.encodeVlq(pair[0]), pair[1]);
   };//end for each in vlqEncodedValues

   var map = new SourceMap();

   map.add(0, 0, 0, 0);
   map.add(1, 5, 2, 4);
   map.add(1, 6, 2, 7);
   map.add(1, 9, 2, 8);
   map.add(3, 0, 3, 4);

   var testWithFilenames = map.generate({sourceRoot: "", sourceFiles: ["source.coffee"], generatedFile: "source.js"});

   expect("testWithFilenames", JSON.parse(testWithFilenames), {"version": 3, "file": "source.js", "sourceRoot": "", "sources": ["source.coffee"], "names": [], "mappings": "AAAA;;IACK,GAAC,CAAG;IAET"});

   expect("map.generate", JSON.parse(map.generate()), {"version": 3, "file": "", "sourceRoot": "", "sources": [""], "names": [], "mappings": "AAAA;;IACK,GAAC,CAAG;IAET"});

   expect("Look up a generated column - should get back the original source position.", map.sourceLocation(2, 8), new SourceMap.Location(1, 9));


   expect("Look up a point futher along on the same line - should get back the same source position.", map.sourceLocation(2, 10), new SourceMap.Location(1, 9));

