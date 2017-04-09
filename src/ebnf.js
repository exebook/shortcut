/*
	TODO
	allow { a | b c } instead of { (a | b) c }
*/

ebnf_ebnf = `
id=<id>
name = <id>
literal = <str>
line = <line>
typedef = '<' id '>'
terminal = (literal | id)
opt = '[' row ']'
oneof_list = '|' row
oneof = '(' row { oneof_list } ')'
oplist = '{' { row } '}'
list = (terminal | opt | oneof | oplist)
row = list { list }
rule = name '=' (row | typedef)
ebnf = { ( line | rule ) }`

define_ebnf_grammar=
function define_ebnf_grammar(parser){
	// Self compiled from the above
	parser.rule('id', type('id'));
	parser.rule('name', type('id'));
	parser.rule('literal', type('str'));
	parser.rule('line', type('line'));
	parser.rule('typedef', row(lit('<'),'id',lit('>')));
	parser.rule('terminal', oneof('literal','id'));
	parser.rule('opt', row(lit('['),'row',lit(']')));
	parser.rule('oneof_list', row(lit('|'),'row'));
	parser.rule('oneof', row(lit('('),'row',oplist('oneof_list'),lit(')')));
	parser.rule('oplist', row(lit('{'),oplist('row'),lit('}')));
	parser.rule('list', oneof('terminal','opt','oneof','oplist'));
	parser.rule('row', row('list',oplist('list')));
	parser.rule('rule', row('name',lit('='),oneof('row','typedef')));
	parser.rule('ebnf', oplist(oneof('line','rule')));
}

install_ebnf_compilers=
function install_ebnf_compilers(parser){
	set_compiler(parser, 'literal', node=>{
		return 'lit('+node.value+')'
	})
	set_compiler(parser, 'id', node=>{
		return '\''+node.value+'\''
	})
	set_compiler(parser, 'typedef', node=>{
		return 'type(\'' + node.value[1].value + '\')'
	})
	set_compiler(parser, 'rule', node=>{
		return 'parser.rule(\'' + need(node, 0) + '\','  + need(node, 2) +')'
	})
	set_compiler(parser, 'opt', node=>{
		return 'opt(' + need(node, 1) + ')'
	})
	set_compiler(parser, 'oneof', node=>{
		return 'oneof(' + need(node, 1)+ need(node, 2).join('')+')'
	})
	set_compiler(parser, 'oneof_list', node=>{
		return ','+need(node, 1)
	})
	set_compiler(parser, 'oplist', node=>{
		return 'oplist(' + need(node, 1) +')'
	})
	set_compiler(parser, 'row', node=>{
		if (node.value.length == 1) {
			return need(node, 0)
		}
		var sub = compile_all(node)
		return 'row(' + sub.join(',') + ')'
	})
}
