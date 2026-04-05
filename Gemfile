source "https://rubygems.org"

ruby "3.4.2"

gem "rails", "~> 8.1.3"

# Asset pipeline
gem "propshaft"

# PostgreSQL adapter
gem "pg", "~> 1.5"

# Web server
gem "puma", ">= 5.0"

# JavaScript bundling
gem "jsbundling-rails"

# ActionCable backed by PostgreSQL (no Redis)
gem "solid_cable"

# Background jobs backed by PostgreSQL (no Redis/Sidekiq)
gem "solid_queue"

# Cache backed by PostgreSQL (no Redis)
gem "solid_cache"

# Authentication for admin users
gem "devise"

# JSON builder
gem "jbuilder"

# JWT for session tokens
gem "jwt"

# Windows timezone data
gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]

# Boot time optimization
gem "bootsnap", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri mswin mswin64 mingw x64_mingw ]
end

group :development do
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
