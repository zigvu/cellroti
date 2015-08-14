class Api::Stream::LeaguesController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::League
    @streamObjParamsPermit = :name, :description, :sport_id
  end
end
