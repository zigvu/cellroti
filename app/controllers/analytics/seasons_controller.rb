module Analytics
  class SeasonsController < ApplicationController
    authorize_actions_for ::Season

    authority_actions :summary => :read
    authority_actions :game => :read
    authority_actions :updateDetGroups => :read

    before_filter :ensure_html_format
    before_action :set_season, only: [:show, :summary, :game, :updateDetGroups]
    before_action :set_client

    # GET /seasons
    def index
      allowedSeasons = @client.settings.getSeasonsAllowed
      @seasons = Season.where(id: allowedSeasons)
    end

    # GET /seasons/1
    def show
      # TODO:
      # @games = season.games.join(:videos).where(videos: {runstatus: <TODO>})
      @games = @season.games
    end

    # GET /seasons/1/summary
    def summary
      current_user.settings.replaceSeasonAnalysisSeasonId(@season.id)
      @gameId = current_user.settings.getSeasonAnalysisGameId.first
    end

    # GET /seasons/1/game/1
    def game
      @game = ::Game.find(season_params[:game_id])
      authorize_action_for @game.sub_season.season

      current_user.settings.replaceSeasonAnalysisGameId(@game.id)
      redirect_to summary_analytics_season_path
    end

    # POST /seasons/1/updateDetGroups
    def updateDetGroups
      detGroupIds = season_params[:det_group_ids].map{ |s| s.to_i }
      clientDgIds = @client.det_groups.pluck(:id).select{ |d| d if detGroupIds.include?(d) }
      clientDgIds = clientDgIds[0..5]

      current_user.settings.replaceSeasonAnalysisDetGroupIds(clientDgIds)
      redirect_to summary_analytics_season_path
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_season
        @season = ::Season.find(season_params[:id])
        authorize_action_for @season
      end

      def set_client
        @client = current_user.client
      end

      # Only allow a trusted parameter "white list" through.
      def season_params
        params.permit(:utf8, :authenticity_token, :commit, :id, :game_id, :det_group_ids => [])
      end
  end
end
