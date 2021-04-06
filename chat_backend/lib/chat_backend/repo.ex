defmodule ChatBackend.Repo do
  use Ecto.Repo,
    otp_app: :chat_backend,
    adapter: Ecto.Adapters.Postgres
end
