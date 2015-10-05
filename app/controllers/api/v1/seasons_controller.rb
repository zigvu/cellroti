class Api::V1::SeasonsController < ApplicationController
  authorize_actions_for ::Season
  authority_actions :summary => :read
  authority_actions :game => :read
  authority_actions :filter => :read

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
      params.permit(:id, :format, :game_id, :filters => [:season_id, :game_id])
    end
end
