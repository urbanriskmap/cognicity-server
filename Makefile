test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--harmony \
		--bail \
		--compilers js:babel-register \
		src/api/routes/*/test.js

.PHONY: test
