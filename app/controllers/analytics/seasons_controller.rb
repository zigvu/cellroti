module Analytics
  class SeasonsController < ApplicationController
    authorize_actions_for ::Season

    authority_actions :summary => :read
    authority_actions :game => :read

    before_filter :ensure_html_format
    before_action :set_season, only: [:show, :summary, :game]
    before_action :set_client

    # GET /seasons
    def index
      mc = Managers::MClient.new(@client)
      @seasons = Season.where(id: mc.getAllowedSeasonIds)
    end

    # GET /seasons/1
    def show
      # TODO:
      # @games = season.games.join(:videos).where(videos: {runstatus: <TODO>})
      @games = @season.games
    end

    # GET /seasons/1/summary
    def summary
    end

    # GET /seasons/1/game/1
    def game
      @game = ::Game.find(season_params[:game_id])
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_season
        @season = ::Season.find(params[:id])
        authorize_action_for @season
      end

      def set_client
        @client = current_user.client
      end

      # Only allow a trusted parameter "white list" through.
      def season_params
        params.permit(:id, :game_id)
      end
  end
end