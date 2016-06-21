require 'fileutils'

class Api::Stream::FrameDataController < ApplicationController
  # devise still requires to be logged in
  authorize_actions_for ::Game

  before_filter :ensure_json_format
  skip_before_filter :verify_authenticity_token

  # GET /frame_data
  def index
    frameNumbers = []
    videoIds = frame_data_params[:video_ids].split(',').map{ |s| s.to_i }
    videos = ::Video.where(id: videoIds)
    videos.each do |video|
      frameNumbers << {
        video_id: video.id,
        frame_numbers: video.video_detections.first.extracted_frames
      }
    end
    render json: frameNumbers.to_json
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def frame_data_params
      params.permit(:video_ids, :files)
    end
end
