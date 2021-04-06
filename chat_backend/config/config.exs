# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :chat_backend,
  ecto_repos: [ChatBackend.Repo]

# Configures the endpoint
config :chat_backend, ChatBackendWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "2ElMiShBt8ZwAUZ6jjTG2tgZTLF4KQvHv3dul9on6eyz1hjBs2HPLWOto5yz/aOR",
  render_errors: [view: ChatBackendWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: ChatBackend.PubSub,
  live_view: [signing_salt: "j59mDgh3"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
