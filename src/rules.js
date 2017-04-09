
lit=
function rule_literal(literal){
	return {
		literal: literal,
		name: null,
		parse_func: parse_literal,
		parse_name: 'parse_literal',
		items: null,
		compile: compile_literal,
	}
}

type=
function rule_type(type_name){
	return {
		type: type_name,
		name: null,
		parse_func: parse_token_type,
		parse_name: 'parse_token_type',
		items: null,
		compile: null,
	}
}

row=
function rule_sequence(){
	var args = Array.prototype.slice.apply(arguments)

	return {
		name: null,
		parse_func: parse_unit_string,
		parse_name: 'parse_unit_string',
		items: args,
		compile: compile_all,
	}
}

oneof=
function rule_one_of(){
	var args = Array.prototype.slice.apply(arguments)

	return {
		name: null,
		parse_func: parse_one_of,
		parse_name: 'parse_one_of',
		items: args,
		compile: compile_all,
	}
}

oplist=
function rule_optional_list(){
	var args = Array.prototype.slice.apply(arguments)
	if (args.length > 1) fatal('oplist() accepts single argument but received: ' + args)

	return {
		name: null,
		parse_name: 'parse_zero_or_more',
		parse_func: parse_zero_or_more,
		items: args,
		compile: compile_all,
	}

}

opt=
function rule_optional(){
	var args = Array.prototype.slice.apply(arguments)
	if (args.length > 1) fatal('opt() accepts single argument but received: ' + args)

	return {
		name: null,
		parse_func: parse_optional,
		parse_name: 'parse_optional',
		items: args,
		compile: compile_all,
	}
}

add_rule=
function (name, rule, compile){
	if (compile == undefined) {
		compile = compile_all
	}

	rule.name = name
	rule.compile = compile

	this.rules[name] = rule
}


