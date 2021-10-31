task default: %w[serve]

task :serve do
	system "docker run --rm -p 5000:4000 --volume='#{Dir.pwd}:/srv/jekyll' -it jekyll/jekyll:3.8 jekyll serve --watch --verbose"
end