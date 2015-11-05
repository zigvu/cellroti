module Analytics
  class ChartingController < ApplicationController
    authorize_actions_for ::Season
    authority_actions :dashboard => :read
    authority_actions :analysis => :read

    before_filter :ensure_html_format
    before_action :set_client

    # GET /dashboard
    def dashboard
    end

    # GET /analysis
    def analysis
      needToSetSeason = false
      # if season has been visited before
      seasonId = current_user.settings.getSeasonAnalysisSeasonId.first
      @gameId = current_user.settings.getSeasonAnalysisGameId.first
      # if there is no visited season, get one from client
      if not seasonId
        seasonId = @client.settings.getSeasonsAllowed.first
        needToSetSeason = true
      end
      # if the client doesn't have any seasons assigned, redirect to root with error
      if not seasonId
        redirect_to root_path, alert: "No season data found - please contact Zigvu support"
      else
        @season = ::Season.find(seasonId)
        authorize_action_for @season
        # if authorized, set season as current season
        current_user.settings.replaceSeasonAnalysisSeasonId(seasonId) if needToSetSeason
      end
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_client
        @client = current_user.client
      end

      # Only allow a trusted parameter "white list" through.
      def charting_params
        params.permit()
      end
  end
end
