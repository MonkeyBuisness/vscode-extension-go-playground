all: compile

compile: compile-extension | compile-renderers

compile-extension:
	npm run compile

compile-renderers:
	npm run compile-renderers

publish:
	vsce publish
