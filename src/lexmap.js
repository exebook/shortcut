'use strict'

/*
	NEW VERSION: no spaces in the result, linked list, indents on lines as numbers
	Patched Elfu version for shortcut, no unicode symbols.
*/

var startMap
module.exports.join = join
module.exports.lex = function(s) {
	if (timed) console.time('lexer')
	if (startMap == undefined) initStartMap()
	var ret = mainLoop(s)
	removeComments(ret)
	if (timed) console.timeEnd('lexer')
	return ret
}

function removeComments(token){
	while (token){
		if (token.type == 'rem') {
			token.prev.next = token.next
			token.next.prev = token.prev
		}
		token = token.next
	}
	return 
}
function isCharNum(c) { return (c >= '0' && c <= '9') }

function isCharAlpha(c) {
	return startMap[c.charCodeAt(0)] == 3
}

function isCharHex(c) {
	if (isCharNum(c)) return true
	if (c >= 'a' && c <= 'f') return true
	if (c >= 'A' && c <= 'F') return true
	return false
}

function initStartMap() {
	startMap = new Uint8Array(0xffff)
	for (var q = 0; q < startMap.length; q++) startMap[q] = 0;
	
	function addStart(chars, type) {
		for (var i = 0; i < chars.length; i++) {
			startMap[chars.charCodeAt(i)] = type
		}
	}
	
	addStart('\n', 1)
	addStart(' \t\r', 2)
	addStart('_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)
	addStart('АБВГЕДЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя', 3)
	for (var c = 0x0370; c <= 0x03ff; c++) startMap[c] = 3
	addStart('0', 4)
	addStart('123456789', 5)
	addStart('\'', 6)
	addStart('"`', 7)
	addStart('/', 8)
	addStart(':', 9)
	addStart('.', 10)
	addStart('+', 11)
	addStart('-', 12)
	addStart('!', 13)
	addStart('|', 14)
	addStart('&', 15)
	addStart('*', 16)
	addStart('%', 17)
	addStart('=', 18)
	addStart('>', 19)
	addStart('<', 20)
	addStart('#$@()]{}?,;^', 24)
	addStart('[', 25)
	addStart(']', 29)
	addStart('(', 30)
	addStart(')', 31)
	addStart('{', 32)
	addStart('}', 33)
}	

var typeMap = [], startTypeMap

function makeTypeMap() {
	var i, e, b, s, R, A, brackets, braces, parens, line_num
	
	startTypeMap = function (_s) {
		s = _s
		i = 0
		line_num = 1
		e = s.length
		R = { s:'$BOF', type: 'bof', next: {} }
		R.next.prev = R
		A = R
		brackets = []
		braces = []
		parens = []
		return run()
	}
	function run() {
		while (i < e) {
			var src_pos = i
			var id = startMap[s.charCodeAt(i)]
			var O = typeMap[id]()
			if (O != undefined) {
				A = A.next
				A.src = src_pos
				A.line = line_num
				A.type = O.type
				A.s = O.s
				A.next = { prev: A }
			}
		}
		A = A.next
		A.type = 'eof'
		A.src = i
		A.line = line_num+1
		A.s = '$EOF'

		return R
	}
	
	function inc_line_num(correction){
		for (var j = i; j < b; j++) if (s[j] == '\n') line_num++
		if (correction) line_num += correction
	}
	
	typeMap[0] = function () {
		console.log('default')
		var O = {type: 'tok', s:s[i++]}
		console.log('UNRECOGNIZED TOKEN:', '"'+O.s+'"', O.s.charCodeAt())
		console.log('"'+s.slice(i-20,i+20)+'"')
		try {
			var r = O.not.found.at.all
		} catch(e) {
			console.log(e.stack)
		}
		for (var i = 0; i < O.s.length; i++) console.log(i, O.s.charCodeAt(i))
		console.log(s.substr(i - 20, 40))
		process.exit()
	}

	typeMap[1] = function () {
		b = i
		while (++b < e) {
			var c = s[b]
			if (c != ' ' && c != '\t' && c != '\r') break
		}
		var indent = b-i-1
		line_num++
		return {type:'line', s:cut()}
	}
	typeMap[2] = function () {
		b = i
		while (++b < e) {
			var c = s[b]
			if (c != ' ' && c != '\t' && c != '\r') break
		}
		i = b
		return undefined
	}

	typeMap[3] = function () {
		b = i
		while (++b < e) {
			var c = s[b]
			if (isCharAlpha(c) || isCharNum(c)) continue
			break
		}
		return {type:'id', s:cut()}
	}
	typeMap[4] = function () {
		if (s[i+1] == 'x') {
			b = i+1
			while (++b < e) {
				if (!isCharHex(s[b])) break
			}
			return {type:'hexnum', s:cut()}
		}
		return typeMap[5]()
	}
	typeMap[5] = function () {
		b = i
		var dot = false
		while (++b < e) {
			if (s[b] == '.') {
				if (dot) break
				dot = true
				continue
			}
			if (!isCharNum(s[b])) break
		}
		return {type:'num', s:cut()}
	}
	typeMap[6] = function () {
		if (s.substr(i, 4) == "'''\n") {
			b = s.indexOf("'''", i + 4)
			if (b < 0) return [{type:"error, unterminated long string: '''"}]
			else {
				var longs = s.slice(i + 4, b)
					.split('\\').join('\\\\')
					.split('\n').join('\\n')
					.split('"').join('\\"')
				inc_line_num(0)
				i = b + 3//4
				return {type:'str', s:'"'+longs+'"'}
			}
		}
		return typeMap[7]()
	}
	typeMap[7] = function () {
		b = i
		while (true) {
			b++
			b = s.indexOf(s[i], b)
			if (b < 0) break
			if (s[b - 1] != '\\') break; else if (s[b - 2] == '\\') break;
		}
		if (b < 0) b = e; else b++
		return {type:'str', s:cut()}
	}
	typeMap[8] = function () {
		if (s[i+1] == '*') {
			b = s.indexOf('*'+'/', i+2)
			if (b < 0) b = e; else b+=2
			inc_line_num()
			return {type:'rem', s:cut()}
		}
		else if (s[i+1] == '/') {
			b = s.indexOf('\n', i+2)
			if (b < 0) b = e
			inc_line_num()
			return {type:'rem', s:cut()}
		}
		else if (s[i+1] == '=') {
			b=i+2;
			return {type:'sym', s:cut()}
		}
		else { 
			// regexp?
			// TODO: handle modifiers like /g
			var p = A
			if (p.type!='num'&&p.type!='id'&&p.s!=')'&&p.s!=']'&&p.s.charCodeAt(0)<128) {
				b = i
				while (++b < e) {
					if (s[b] == '\\') b++
					else if (s[b] == '/') break
				}
				b++
				return {type:'regex', s:cut()}
			}
			else {
				b=i+1
				return {type:'sym', s:cut()}
			}
		}
	}
	typeMap[9] = function () {
		b=i
		switch(s[i+1]) { case':':case'=': b=i+2; break; default: b=i+1 }
//		if (s[i+1] == ':') b=i+2; else if (s[i+1] == '=') b=i+2; else b=i+1
		return {type:'sym', s:cut()}
	}
	typeMap[10] = function () {
		if (s[i+1] == '(') b=i+2; else b=i+1
		return {type:'sym', s:cut()}
	}
	typeMap[11] = function () {
		switch(s[i+1]) { case'=':case'+': b=i+2; break; default: b=i+1 }
		return {type:'sym', s:cut()}
	}
	typeMap[12] = function () {
		switch(s[i+1]) { case'=':case'-': b=i+2; break; default: b=i+1 }
		return {type:'sym', s:cut()}
	}
	typeMap[13] = function () {
		if (s[i+1] == '=') b=i+2; else b=i+1
		return {type:'sym', s:cut()}
	}
	typeMap[14] = function () {
		switch(s[i+1]) { case'=':case'|': b=i+2; break; default: b=i+1 }
		return {type:'sym', s:cut()}
	}
	typeMap[15] = function () {
		switch(s[i+1]) { case'=':case'&': b=i+2; break; default: b=i+1 }
		return {type:'sym', s:cut()}
	}
	typeMap[16] = function () {
		switch(s[i+1]) { case'=':case'*': b=i+2; break; default: b=i+1 }
		return {type:'sym', s:cut()}
	}
	typeMap[17] = function () {
		if (s[i+1] == '=') b=i+2; else b=i+1
		return {type:'sym', s:cut()}
	}
	typeMap[18] = function () {
		if (s[i+1] == '=') {
			if (s[i+2] == '=') { b=i+3 }
			else b=i+2;
		} else b=i+1
		return {type:'sym', s:cut()}
	}
	typeMap[19] = function () {
		switch (s[i+1]) {
			case'=': //>=
				b=i+2
			break
			case'>':
				switch(s[i+2]) {
					case'=': // >>=
						b=i+3
					break
					case'>':
						switch(s[i+3]) {
							case'=': // >>>=
								b=i+4
							break
							default:
								b=i+3 // >>>
						}
					break
					default: //>>
						b=i+2
				}
			break
			default: // >
				b=i+1
		}
		return {type:'sym', s:cut()}
	}
	typeMap[20] = function () {
		switch (s[i+1]) {
			case'=':
				b=i+2
			break
			case'<':
				switch(s[i+2]) {
					case'=':
						b=i+3
					break
					case'<':
						switch(s[i+3]) {
							case'=':
								b=i+4
							break
							default:
								b=i+3
						}
					break
					default:
						b=i+2
				}
			break
			default:
				b=i+1
		}
		return {type:'sym', s:cut()}
	}
	typeMap[24] = function () {
		b=i+1;
		return {type:'sym', s:cut()}
	}
	typeMap[25] = function () { // [
		if (s[i+1] == '@') b=i+2; else b=i+1
		var O = {type:'sym', s:cut()}
		if (O.s.length==1) {
			brackets.push(A.next)
		}
		return O
	}
	typeMap[29] = function () { // ]
		b=i+1;
		var open = brackets.pop(), O = {type:'sym', s:cut() }
		open.pair = A.next
		A.next.pair = open
		return O
	}
	typeMap[30] = function () { // (
		b=i+1
		var O = {type:'sym', s:cut()}
		parens.push(A.next)
		return O
	}
	typeMap[31] = function () { // )
		b=i+1
		var open = parens.pop(), O = {type:'sym', s:cut() }
		open.pair = A.next
		A.next.pair = open
		return O
	}
	typeMap[32] = function () { // {
		b=i+1
		var O = {type:'sym', s:cut()}
		braces.push(A.next)
		return O
	}
	typeMap[33] = function () { // }
		b=i+1
		var open = braces.pop(), O = {type:'sym', s:cut() }
		open.pair = A.next
		A.next.pair = open
		return O
	}

	function cut() { var R = s.substr(i, b-i); i=b; return R }
}

makeTypeMap()
return

function mainLoop(s) {
	return startTypeMap(s)
}

function join(A, opt) {
	var R = []
	for (var i = 0; i < A.length; i++) R.push(opt == 'untab'?A[i].s.replace('\t', '   '):A[i].s)
	return R.join('')
}

