class Api::Stream::TeamsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::Team
    @streamObjParamsPermit = :name, :description, :icon_path, :league_id
  end
end
