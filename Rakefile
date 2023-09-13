task :default => :serve

desc 'Serve site from container'
task :serve do
  sh "docker run --rm -it -v '#{__dir__}/vendor/bundle:/usr/local/bundle' -v '#{__dir__}:/srv/jekyll' -p 4000:4000 jekyll/jekyll:4 jekyll serve --watch --verbose --drafts"
end

task :test do
  require "html-proofer"
  HTMPProofer.check_directory(
    "./_site"
  ).run
end
