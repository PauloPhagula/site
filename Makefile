
.PHONY: serve
serve:
	docker run --rm -p 5000:4000 --volume="$(PWD):/srv/jekyll" -it jekyll/jekyll:3.8 jekyll serve --watch --verbose
