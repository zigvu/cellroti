class Api::Stream::JsonDataController < ApplicationController
  # devise still requires to be logged in
  authorize_actions_for ::Game

  before_filter :ensure_json_format
  skip_before_filter :verify_authenticity_token

  # POST /json_data
  def create
    kheerVideoId = json_data_params[:kheer_video_id].to_i
    gameId = json_data_params[:game_id].to_i
    channelId = json_data_params[:channel_id].to_i
    video = nil

    success = false
    message = "Could not process kheer_video_id: #{kheerVideoId} : "
    if ::Video.where(game_id: gameId, channel_id: channelId).count > 0
      message = message + "Video already exists in cellroti"
    else
      video = ::Video.create(game_id: gameId, channel_id: channelId)

      mVideo = Managers::MVideo.new(video)
      videoMetaDataFile = mVideo.get_video_meta_data_file
      detectableIdsFile = mVideo.get_detectable_ids_file
      eventsFile = mVideo.get_events_file
      localizationFile = mVideo.get_localization_file

      File.open(videoMetaDataFile, "wb") { |f| f.write(json_data_params[:video_meta_data].read) }
      File.open(detectableIdsFile, "wb") { |f| f.write(json_data_params[:detectable_ids].read) }
      File.open(eventsFile, "wb") { |f| f.write(json_data_params[:events].read) }
      File.open(localizationFile, "wb") { |f| f.write(json_data_params[:localizations].read) }
      success = true

      # kick off metrics creation
      status = Services::VideoDataImportService.new(::Client.zigvu_client, video).create()
      if not status
        success = false
        message = message + "Could not start delayed job in cellroti"
      end
    end
    if success
      render json: {cellroti_video_id: video.id}.to_json
    else
      render json: {error: message}.to_json
    end
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def json_data_params
      params.permit(:kheer_video_id, :game_id, :channel_id,
        :video_meta_data, :detectable_ids, :events, :localizations)
    end
end
