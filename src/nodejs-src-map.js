make_source_map =
function make_source_map(js){
	js = js.replace(/\t/g, '')
	js = js.split('(src@')
	var result = 'require("source-map-support").install();' + js[0]
	var map = {}
	for (var i = 1; i < js.length; i++){
		var x = js[i].indexOf(')')
		var n = js[i].substr(0, x)
		n = parseInt(n)
		js[i] = js[i].substr(x+1)
		if (js[i] == 'un') {
			//n += 7
		}
		map[n] = result.length
		result += js[i]
		//console.log('x='+x, '"'+js[i].replace(/\n/g, '\\n')+'"', '"'+parseInt(n)+'".')
//		process.exit()
	}
	//console.log(js)
	//console.log(JSON.stringify(map))
	result += '\n//# sourceMappingURL=main.map\n'
	return [map, result]
}

node_source_map = 
function node_source_map(map, src, out){
	var SourceMapIndexGenerator = require('source-map-index-generator');

	var input = src
		 output = out,
		 srcFile = 'main.uu',
		 coordmap = map
	var generator = new SourceMapIndexGenerator({
		file: 'main.uu',
		sourceRoot: ''
	});

	generator.addIndexMapping({
	  src: srcFile,
	  input: input,
	  output: output,
	  map: coordmap
	});

	var s = generator.toString(); 
	require('fs').writeFileSync('main.map', s)
}

