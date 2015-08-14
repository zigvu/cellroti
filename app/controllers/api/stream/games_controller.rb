class Api::Stream::GamesController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::Game
    @streamObjParamsPermit = :name, :description, :start_date, :venue_city, :venue_stadium, :sub_season_id
  end
end
