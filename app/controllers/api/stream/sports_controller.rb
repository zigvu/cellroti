class Api::Stream::SportsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::Sport
    @streamObjParamsPermit = :name, :description
  end
end
