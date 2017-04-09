
timed = false
indent = 0
show_grammar = false 
trace_linking = false

ilog = function ilog(){
	var args = Array.prototype.slice.apply(arguments)
	var s = ''
	while (s.length < indent * 3) s += '|  '
	args = args.map(x=>x?x:'undefined')
	console.log(''+s+ args.join(' '))
}

log = function log(){
	var args = Array.prototype.slice.apply(arguments)
	args = args.map(x=>x!=undefined?x:'undefined')
	console.log(args.join(' '))
}

trace_log=
function trace_log(parse_func, unit, token){
	if (trace) ilog(`${parse_func}[${unit.name?unit.name:unit.parse_name+'()'}] at ${JSON.stringify(token.s)}`)
}

trace_nil=
function trace_nil(parse_func, unit, token){
	if (trace) ilog(`null`)
}

begin=
function begin(){
	indent++
}

end=
function end(){
	indent--
}


func_name=
function func_name(f){
	if (f)
		return f.toString().split('(')[0].split(' ')[1]+'()'
	else return '--'
}

fatal = 
function fatal(msg){
	var args = Array.prototype.slice.apply(arguments)
	console.log(args.join(' '))
	process.exit()
}

function static(name){
	return arguments.callee.caller
}

function show_role(rule){
	var s = ''
	if (rule.literal) s ='literal(' + rule.literal+')'
	else if (rule.type) s ='type(' + rule.type+')'
	else {
		s = rule.parse_func.name
		var items = rule.items.map(x=>x.name).join(' ')
		s += ' (' + items + ')'
	}
	console.log('rule',rule.name+':', s)
}

function circular(x){
	var s = []
	for(let i in x){
		if (typeof x[i] == 'object') s.push(i + ': {*}')
		else
			s.push(i + ':' + x[i])
	}
	return s.join(': ')
}

JS = function JS(x){
	if (x == null) return 'null'
	try {
		var s = JSON.stringify(x)
	} catch(em){
		if (em == 'TypeError: Converting circular structure to JSON'){
			return 'circular: '+circular(x);
		}
		process.exit()
	}
	if (s.length < 80) return s
	return JSON.stringify(x, 0, '   ')
}

kill = function (){
	log('killed.')
	process.exit
}


dump_grammar=
function dump_grammar(root){
	var recursive = {}
	if (root == undefined) fatal('Root rule is undefined')
	var max = 30;

	function go(rule) {
		if (recursive[rule] == true) {
			return 'circular'
		}
		recursive[rule] = true
		if (max-- == 0) fatal('Stack')
		if (typeof rule == 'string') {
			ilog(color(196),'Rule: "'+rule+'"',color(),'<---')
			fatal('"'+rule + '" is not converted to an object')
		}
		ilog('Rule:', rule.name?rule.name:rule.parse_name+'()')
		
		if (rule.items){
			if (typeof rule.items == 'string') fatal(rule.name, ' is not an object2')
			rule.items.forEach(sub=>{
				begin()
					go(sub)
				end()
			})
		}
	}
	
	ilog('Grammar:')
	begin()
		go(root)
	end()
	ilog('End grammar.')
}

