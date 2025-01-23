# frozen_string_literal: true

task default: :serve

desc 'Serve site from container'
task :serve do
  sh "docker run --rm -it -v '#{__dir__}/vendor/bundle:/usr/local/bundle' -v '#{__dir__}:/srv/jekyll' -p 4000:4000 jekyll/jekyll:4 jekyll serve --watch --verbose --drafts"
end

task :test do
  require 'html-proofer'
  options = {
    checks: [
      'Links',
      'Images',
      'Scripts',
    ],
    ignore_empty_alt: true,
    ignore_missing_alt: true,
    check_external_hash: false,
    check_internal_hash: false,
  }

  HTMPProofer.check_directory(
    './_site',
    options
  ).run
end
