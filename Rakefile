task :default => :serve

desc 'Serve site from container'
task :serve do
  sh "docker run --rm -p 4000:4000 --volume='#{__dir__}/vendor/bundle:/usr/local/bundle' --volume='#{__dir__}:/srv/jekyll' -it jekyll/jekyll:4 jekyll serve --watch --verbose --drafts"
end

task :test do
  require "html-proofer"
  HTMPProofer.check_directory(
    "./_site"
  ).run
end
