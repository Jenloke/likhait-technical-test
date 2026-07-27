# syntax = docker/dockerfile:1

# Use Ruby 3.3.7
ARG RUBY_VERSION=3.3.7
FROM ruby:$RUBY_VERSION-slim

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential ca-certificates default-mysql-client default-libmysqlclient-dev git libyaml-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY Gemfile Gemfile.lock ./

# Configure bundler and install gems with retry logic.
# Gems install to the default BUNDLE_PATH (/usr/local/bundle, set by the base
# ruby image), matching the backend_gems volume mounted there in compose.
RUN bundle config set --local deployment 'false' && \
    bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile --gemfile app/ lib/

# Entrypoint prepares the database
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default
EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]