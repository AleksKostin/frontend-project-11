install:
	npm ci

develop:
	npx webpack serve --open

build:
	NODE_ENV=production npx webpack
	
lint:
	npx eslint .