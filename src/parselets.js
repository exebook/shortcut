trace = false

node = function node(x){
	return { rule: x[1], value: x[2], src: x[0].prev }
}

function literal(rule, token){
	if (token == undefined) return
	if (token.s == rule.literal) {
		var next = token.next
		return [next, rule, token.s]
	}
}

function token_type(rule, token){
	if (token == undefined) return
	if (token.type == rule.type){
		return [token.next, rule, token.s]
	}
}

function repeator(rule, token, flag){
	var items = []
	var sub = rule.items[0]
	while(true){
		begin()
		var ret = sub.parse_func(sub, token)
		end()
		if (ret == undefined){
			if (flag == 1 && items.length == 0) return
			break
		}
		items.push(node(ret))
		token = ret[0]
		if (flag == 2) break
   }
	return [token, rule, items]
}

function zero_or_more(rule, token){
	trace_log('zero_or_more', rule, token)
	return repeator(rule, token, 0)
}

function one_or_more(rule, token){
	trace_log('one_or_more', rule, token)
	return repeator(rule, token, 1)
}

function optional(rule, token){
	trace_log('optional', rule, token)
	return repeator(rule, token, 2)
}

function one_of(rule, token){
	trace_log('one_of', rule, token)
	for (var i = 0; i < rule.items.length; i++){
		var sub = rule.items[i]
		begin()
		var ret = sub.parse_func(sub, token)
		end()
		if (ret != undefined){
			return [ret[0], rule, node(ret)]
		}
	}
}

function empty(x){
	if (x == undefined) return true
	if (typeof x.value == 'object' && x.value.map == [].map && x.value.length == 0) return true
	return false
}

function unit_string(rule, token){
	trace_log('unit_string', rule, token)
	var items = []
	for (var i = 0; i < rule.items.length; i++){
		var sub = rule.items[i]
		begin()
		var ret = sub.parse_func(sub, token)
		end()
		if (ret == undefined){
			trace_nil()
			return
		}
		if ((sub.parse_func == optional || sub.parse_func == zero_or_more)&& empty(node(ret))){
			//console.log('Empty optional case.')
		}
		else {
			items.push(node(ret))
		}
		token = ret[0]
	}
	return [token, rule, items]
}

//function longest(rule, token){
   //if (token == rule.recurse_protection) {
		//console.log(token == rule.recurse_protection)
		//console.log(token.s, rule.recurse_protection.s)
		//return
	//}
   //var back = rule.recurse_protection;
   //var max = -1
	//var best

   //rule.recurse_protection = token
   //for(var i = 0; i < rule.items.length; i++){
		//var sub = rule.items[i]
		//var ret = sub.parse_func(sub, token)
		//if (ret == undefined) {
			//continue
		//}
      //if (ret.token.src > max){
         //max = ret.token.src
			//best = ret
      //}
   //}
   //rule.recurse_protection = back
	//if (best == undefined) return
	//return [best.token, rule, node(best)]
//}

//parse_longest=longest
parse_unit_string=unit_string
parse_one_of=one_of
parse_optional=optional
parse_one_or_more=one_or_more
parse_zero_or_more=zero_or_more
parse_token_type=token_type
parse_literal=literal
