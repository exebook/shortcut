

need=
function need(node, x){
	var sub = node.value[x]
	if (sub){
		var ret = sub.rule.compile(sub)
		return ret
	}
}
compile_concat=
function compile_concat(node){

	function is_alpha_num(char){
		if (char >= '0'  && char <= '9') return true
		if (char >= 'A'  && char <= 'Z') return true
		if (char >= 'a'  && char <= 'z') return true
		return false
	}

	if (typeof node == 'string') return node
	var ret = []
	node.forEach(x=>{
		if (typeof x == 'string') ret.push(x)
		else if (typeof x == 'object' && x.map == [].map) ret.push(compile_concat(x))
	})
	var s = '', prev_id = false, id = false
	for (let i = 0; i < ret.length; i++){
		if (i > 0 && is_alpha_num(ret[i]) && is_alpha_num(ret[i-1]))
			s += ' '
		s += ret[i]
	}
	return s
}

compile_literal=
function compile_literal(node){
	return node.value
	//return '(src@'+node.src.src+')'+node.value
}

compile_id=
function compile_id(node){
	return node.value
	//return '(src@'+node.src.src+')'+node.value
}

compile_num=
function compile_num(node){
	return node.value
	//return '(src@'+node.src.src+')'+node.value
}

compile_none=
function compile_none(node){
	return ''
}

compile_all=
function compile_all(node){
	if (node.value.map != [].map){
		// Leaf
		if (node.value.rule && node.value.rule.compile){
			indent++
			//console.log(color(55)+'leaf'+color(8), node.value.rule.name)
			return node.value.rule.compile(node.value)
			indent--
		}
		else {
			// Terminal
			return node.value
		}
	}
	else {
		// Branch
		var code = node.value.map(sub=>{
			if (sub.rule.compile){
				indent++
				var ret = sub.rule.compile(sub)
				indent--
				return ret
			}
			else {
				fatal('error: '+sub.rule.parse_name+'.compile() not found,', JS(node.src.s))
			}
		})
		return code
	}
}

compile_ast=
function compile_ast(node){
	if (timed) console.time('compiling')
	var ret = compile_concat(node.rule.compile(node))
	if (timed) console.timeEnd('compiling')
	return ret
}

set_compiler=
function set_compiler(parser, rule_name, compiler_func){
	if (typeof rule_name == 'string') rule_name = [rule_name]
	rule_name.forEach(name=>{
		if (parser.rules[name])
			parser.rules[name].compile = compiler_func
	})
}

replacer=
function replacer(to){
	return ()=>[to]
}


