
-- from http://en.literateprograms.org/Fibonacci_numbers_%28Lua%29
return function (n)
	fibs={1,1}

	for i=3,n do
		fibs[i]=fibs[i-1]+fibs[i-2]
	end

	return fibs[n]
end