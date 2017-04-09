test(
	'f(2+2) f() f(555) f([1,2,3])',
	'f((2+2));f();f(555);f([1,2,3]);'
)
test(
	'a = 123 b := 12 c := [1,2,3]',
	'a=123;var b=12;var c=[1,2,3];'
)
test(
	'a := [f()]'
	'var a=[f()];'
}
test(
	'a := 1+f() x := [f(10-1), 3 plus 3]'
	'var a=1+f();var x=[f(10-1),3+3];'
)
test(
	'a = {a:1,b:2+3+[f(10-1), 2,2,2]}',
	'a={a:1,b:2+3+[f(10-1),2,2,2]};'
)
test(
	'fun z a b c { a = {a:1,b:2 plus 3+[f(10-1), 2,2,2]} ret 4+4*2 } fun q{ ret }',
	'function z(a,b,c){a={a:1,b:(2+3+[f((10-1)),2,2,2])};return (4+(4*2))}function q(){return}'
)
test(
	'x := {a:1,b:{c:4}} y := x.b.c console.log(y)',
	'var x={a:1,b:{c:4}};var y=x.b.c;console.log(y)'
)
test(
	'fun sum a b { ret a + b } a=[1,2,3] x=a[1+1] y=a[sum(0,2 minus 1)]',
	'function sum(a,b){return (a+b)}a=[1,2,3];x=a[(1+1)];y=a[sum(0,(2-1))];'
)
test(
	'a=1+ -1 * -2 x=[-100+ -1] y=1/ -1 z=1',
	'a=(1+(-1*-2));x=[(-100+-1)];y=(1/-1);z=1;'
)
test(
	'b=[1,2,3] a=(1*(2+3)) + b[b[(1+1)]]',
	'b=[1,2,3];a=(((1*((2+3))))+b[b[((1+1))]]);'
)
test(
	'a=(1 or 2)+(1 or 4) a=1 or 2+(1 or 4) a=(1 or 2)+1 or 4 a=1 or 2+1 or 4',
	'a=((1||2)+(1||4));a=1||(2+(1||4));a=((1||2)+1)||4;a=1||(2+1)||4;'
)
test(
	'log 1 or 2+1 or 4, 1, 2, 3, [1,2]\n',
	'console.log(1||2+1||4,1,2,3,[1,2]);\n'
)
test(
	'a:=1 b:=2+2 c:=[1,1,1] d:=c[1] are a b c[1] d\n',
	'var a=1;var b=2+2;var c=[1,1,1];var d=c[1];console.log("a:", a+",","b:", b+",","c[1]:", c[1]+",","d:", d);\n'
)
test(
	'c:=1 are c', // eof test
	'var c=1;console.log("c:", c);\n;'
)
test(
	'log 1',
	'console.log(1);\n;'
)
