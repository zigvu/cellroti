class Api::Stream::EventTypesController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::EventType
    @streamObjParamsPermit = :name, :description, :sport_id, :weight
  end
end
