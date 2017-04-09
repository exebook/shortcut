require('./parselets')

function parser_build_grammar(parser){
	
	function build_rule(rule){
		if (rule.items && rule.items.map == [].map){
			for (var i = 0; i < rule.items.length; i++){
				var sub = rule.items[i]
				if (typeof sub == 'string') {
					if (parser.rules[sub]) rule.items[i] = parser.rules[sub]
					else {
						console.log('Sub rule \''+sub+'\' not found')
						process.exit()
					}
				}
				else {
					begin()
					build_rule(sub)
					end()
				}
			}
		}
	}
	
	var rules = parser.rules
	var names = Object.keys(rules)
	if (trace_linking) ilog('Linking grammar rules:')
	names.forEach(name=>{
		begin()
		if (trace_linking) ilog('Named rule:', name)
		if (typeof rules[name] == 'string') {
			rules[name] = rules[rules[name]]
		}
		else {
			build_rule(rules[name])
		}
		end()
	})
	if (trace_linking) ilog('End linking.')
}

function parser_parse(root_rule, token){

	if (timed) console.time('parsing')
		rule = this.rules[root_rule]
		if (rule == undefined) fatal('root rule not provided')
		if (rule.parse_func == null) fatal('root rule "'+rule.name+'" has no parser')
		var ret = rule.parse_func(rule, token)
	if (timed) console.timeEnd('parsing')
	
	if (ret == undefined) return
	return node(ret)
}

create_parser = function(){
	if (timed) console.time('grammar')
	return {
		noname: [],
		rules: {},
		//add: parser_add,
		parse: parser_parse,
		rule: add_rule
	}
}

build_parser = function(parser){
	parser_build_grammar(parser)
	if (timed) console.timeEnd('grammar')
}
