# frozen_string_literal: true
require "jekyll"

task default: :serve

desc "Serve site from container"
task :serve do
  Jekyll::Commands::Serve.process(
    { "watch" => true, "verbose" => true, "drafts" => true, "port" => 4000 }
  )
end

desc "Build site from container"
task :build do
  Jekyll::Commands::Build.process({ "verbose" => true, "drafts" => true })
end

task :test do
  require "html-proofer"
  options = {
    checks: %w[Links Images Scripts],
    ignore_empty_alt: true,
    ignore_missing_alt: true,
    check_external_hash: false,
    check_internal_hash: false
  }

  HTMPProofer.check_directory("./_site", options).run
end
