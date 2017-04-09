/*
	Дневник разработки компилятора shortcut
	-- портированы куски кода из С++ для рекурсивно-погружного парсинга взятые из компилятора pi.exe который я написал много лет назад.
	-- на его основе был создан lang.js он уже мог делать выражения, функции и даже ветвление, был сделан маппинг line numbers для ноды и уже был создан shortcut файл с целой программой которая компилилась и исполнялась, но он не мог лишь одного -- длинных имен, или rvalue типа a[b](c+d).e
	-- надо переделывать грамматику, а это было очень сложно из-за громоздких конструкций вложеных функций grammar-lang(), поэтому вместо row(opt()) пришлось написать парсер EBNF.
	-- написан парсер EBNF, скомпилировал сам себя и результат этой компиляции включён обратно в код, а исходник грамматики EBNF в виде коммента поставлен сверху в коде.
	-- был начат процесс переписывания грамматики shortcut на EBNF и проблема rvalue
	была решена
	-- был обнаружен глюк во внутреннем представлении грамматического дерева, пришлось его всё перефакторить
	
*/
fs = require('fs')
require('./debug-util')
require('./parser')
require('./compile-nodes')
require('./ast-util')
require('./rules')
require('./ebnf')
var lexmap = require('./lexmap')

//trace=true
//show_grammar = true

main()

//alias=
//function alias(parse, from, to){
	//def(from, lit(from), replacer(to))
//}

function ebnf_to_def(lang_ebnf){
	var parser = create_parser()
	define_ebnf_grammar(parser)
	build_parser(parser)
	install_ebnf_compilers(parser)
	
	var token = lexmap.lex(lang_ebnf).next
	var ast = parser.parse('ebnf',token)
	var output = compile_ast(ast)
	return output
}

function get_source(){
	var src = 'a[f(1).a+1].f[1][2][2+2]=a[b.c].d(1+1)[1] + 1'
	src = 'a.a.a.a.a[b][b][b][b] = a(b)(b)(b)(b)(b+1)'
	src = 'a=a[1] + [1,2,3,f(e[3])] b := nil'
	src = 'a={a:1,b:2==1} b := 1 or 2 || 1'
//	src = 'str each i { are i }'
//	src = 'a+b'
	return src
}

function reduce_ast(node){
	return node
}

function show_ast(ast){
	if (ast == undefined){
		console.log('EMPTY AST')
		return
	}
	print_ast(ast)
}

function show_output(output){
	console.log(output)
}

function handle_parsing_errors(src, ast){
	var parsed_chars = ast.src.next.src
	if (parsed_chars < src.length) {
		var back = 20
		if (parsed_chars < back) back = parsed_chars
		console.log(src.replace(/\n/g,'\\n')
			.substr(parsed_chars - back, back) +''+src.substr(parsed_chars, 40))
		var s = ''
		while (s.length < back) s += ' '
		s += '^ parsing error.'
		console.log(s)
		return  true
	}
}

function compile_test(node){
	return compile_concat(node)
}
function init_parser(parser){
	expressions=fs.readFileSync('grammar.ebnf').toString()
	var lang_rules = ebnf_to_def(expressions)
	parser.rule('nil', lit('nil'), replacer('undefined'))
	parser.rule('plus', lit('plus'), replacer('+'))
	parser.rule('minus', lit('-'), replacer('-'))
	parser.rule('kill', lit('kill'), replacer('process.exit()'))
	parser.rule('ret', lit('ret'), replacer('return'))
	eval(lang_rules)
	build_parser(parser)
}

function main(){
	var parser = create_parser()
	init_parser(parser)
	var src = get_source()
	var root_token = lexmap.lex(src).next
	var ast = parser.parse('root', root_token)
	if (handle_errors(src, ast)) return
	show_ast(ast)
	if (ast) {
		var ast = reduce_ast(ast)
		var output = compile_ast(ast)
		show_output(output)
	}
}

