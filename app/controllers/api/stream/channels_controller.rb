class Api::Stream::ChannelsController < Api::Stream::StreamController
  def initialize
    @streamObjKlass = ::Channel
    @streamObjParamsPermit = :name, :description, :url
  end
end
