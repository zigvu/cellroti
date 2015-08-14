class Api::Stream::SeasonsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::Season
    @streamObjParamsPermit = :name, :description, :league_id
  end
end
