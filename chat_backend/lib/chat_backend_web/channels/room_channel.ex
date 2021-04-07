defmodule ChatBackendWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:jazz", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("coord_move", %{"coords" => coords, "user_id" => user_id}, socket) do
    broadcast!(socket, "coord_move", %{coords: coords, user_id: user_id})
    {:noreply, socket}
  end
end
