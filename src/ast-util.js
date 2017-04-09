color = a=>a?'\u001b[38;5;'+a+'m':color(8);

clean_ast=
function clean_ast(ast){
	for (var i in ast){
		if (i == 'rule') ast.rule = ast.rule.name
		else if (ast[i].map == [].map){
			for (var j = 0; j < ast[i].length; j++){
				clean_ast(ast[i][j])
			}
		}
	}
	return ast
}

show_ast=
function show_ast(ast){
	if (ast == undefined) return 'empty'
	if (ast.rule == undefined) {
		console.log(typeof ast)
		return ast
	}
	var out = [ast.rule.name,'(']
	if (ast.value) {
		if (typeof ast.value == 'string') out.push('\''+ast.value.replace(/\n/g,'\\n')+'\'')
		else if (ast.value.map == [].map){
			var list = []
			ast.value.forEach(x=>{
				//if (x.rule) out.push(show_ast(x.value))
				list.push(show_ast(x))
			})
			out.push(list.join(''))//', '))
		}
		else if(typeof ast.value == 'object'){
			out.push(show_ast(ast.value))
		}
	}
	out.push(')')
	return out.join('')
}

format_ast=
function format_ast(code){
	// Options:
	var tabsize = 3
	var short_expr = 10
	var short_max_depth = 2
	// Internal vars:
	var tab = 0
	var t = ''
	var string = false
	
	enter = ()=>{
		t += '\n'
		let s = ''
		while (s.length < tab*tabsize) s += ' '
		t += s
	}
	
	empty = l=>{
		for (let i = 0; i < l.length; i++){
			if (l[i] != ' ') return false
		}
		return true
	}
	
	function howlong(){
		var level = 0
		var string = false
		for (let j = i; j < i + short_expr; j++){
			if (code[j] == '\'') {
				string = !string
			}
			if (string) continue
			if (code[j] == '(') {
				level++
				if (level > short_max_depth) return true
			}
			else if (code[j] == ')') {
				level--
				if (level == 0) {
					for (; i <= j; i++){
						t += code[i]
					}
					i--
					enter()
					return false
				}
			}
		}
		return true
	}
	
	for (var i = 0; i < code.length; i++){
		let char = code[i]
		if (char == '\'') {
			string = !string
			t += char
			continue
		}
		else if (!string && char == '(') {
			if (howlong()){
				tab++
				enter()
			}
		}
		else if (!string && char == ')') {
			tab--
			enter()
		}
		else {
			t += char
		}
	}
	enter()
	t = t.split('\n').filter(l=>!empty(l)).join('\n')
	return t
}

color_ast=
function color_ast(ast){
	var t = ''
	for (var i = 0; i < ast.length; i++){
		var char = ast[i]
		if (char == '\'') {
			t += color(196)
			t += '\''
			i++
			while (ast[i] != '\''){
				t += ast[i]
				i++
			}
			t += '\''
			t += color(8)
			continue
		}
		t += ast[i]
	}
	var keywords = 'lvalue index expr logic factor term primary literal -- member rvalue'.split(' ')
	for (var k = 0; k < keywords.length; k++){
		t = t.split(keywords[k]).join(color(k) + keywords[k] + color(8))
	}
	return t
}

print_ast=
function print_ast(ast){
	console.log('AST begin')
	//console.log(JSON.stringify(ast,0,'    ').length); return
	console.log(color_ast(format_ast(show_ast(ast))))
	console.log('AST end')
	//	var clean = clean_ast(JSON.parse(JSON.stringify(ast)))
	//	console.log(JSON.stringify(clean,0,'    '))
}

