task :default => :jekyll_serve

desc 'Serve site from container'
task :jekyll_serve do
  sh "docker run --rm -p 4000:4000 --volume='#{__dir__}:/srv/jekyll' -it jekyll/jekyll:4 jekyll serve --watch --verbose --drafts"
end
