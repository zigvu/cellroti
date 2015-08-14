class Api::Stream::GameTeamsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::GameTeam
    @streamObjParamsPermit = :game_id, :team_id
  end
end
