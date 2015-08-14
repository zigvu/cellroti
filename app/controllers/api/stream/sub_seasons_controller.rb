class Api::Stream::SubSeasonsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::SubSeason
    @streamObjParamsPermit = :name, :description, :season_id
  end
end
