class Api::V1::SeasonsController < ApplicationController
  authorize_actions_for ::Season
  authority_actions :summary => :read
  authority_actions :game => :read
  authority_actions :filter => :read
  authority_actions :clip_id => :read

  before_filter :ensure_json_format
  before_action :set_season, only: [:show, :summary, :game]
  before_action :set_client

  # GET /seasons
  def index
    @seasons = Season.all
    render json: @seasons.to_json(:only => [:id, :name])
  end

  # GET /seasons/1
  def show
    jass = Jsonifiers::JAnalyticsSeasonSummary.new(@season)
    render json: jass.to_json
  end

  # GET /seasons/1/summary
  def summary
    jasd = Jsonifiers::JAnalyticsSeasonData.new(@season, current_user)
    render json: jasd.to_json
  end

  # GET /seasons/1/game/1
  def game
    game = Game.find(season_params[:game_id])

    jagd = {error: "Requested game not in requested season"}
    if game.sub_season.season.id == @season.id
      jagd = Jsonifiers::JAnalyticsGameData.new(game, current_user)
    end

    render json: jagd.to_json
  end

  def filter
    sets = current_user.settings
    seasonId = season_params[:filters][:season_id].to_i
    gameId = season_params[:filters][:game_id].to_i

    if seasonId > 0
      authorize_action_for ::Season.find(seasonId)
      sets.replaceSeasonAnalysisSeasonId(seasonId)
    else
      sets.resetSeasonAnalysisSeasonId
    end
    if gameId > 0
      authorize_action_for ::Game.find(gameId).sub_season.season
      sets.replaceSeasonAnalysisGameId(gameId)
    else
      sets.resetSeasonAnalysisGameId
    end

    head :no_content
  end

  def clip_id
    videoFrameList = []
    season_params[:video_frame_list].each do |k, v|
      vId = v[:video_id].to_i
      efn = v[:extracted_frame_number].to_i
      ft = VideoDetection.where(video_id: vId).first
            .frame_detections.where(frame_number: efn).first
            .frame_time
      videoFrameList << [vId, efn, ft]
    end
    isMulti = videoFrameList.count != 1
    shortClip = ::ShortClip.find_or_create_by(
      video_id: videoFrameList[0][0],
      frame_number: videoFrameList[0][1],
      frame_time: videoFrameList[0][2],
      is_multi_clip: isMulti
    )
    Managers::MShortClip.new(shortClip).create_file_if_needed(videoFrameList)
    render json: {clip_id: shortClip.id.to_s}.to_json
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_season
      id = season_params[:id]
      @season = ::Season.find(id)
      authorize_action_for @season
    end

    def set_client
      @client = current_user.client
    end

    # Only allow a trusted parameter "white list" through.
    def season_params
      params.permit(:id, :format, :game_id, :video_frame_list => [:video_id, :extracted_frame_number], :filters => [:season_id, :game_id])
    end
end
