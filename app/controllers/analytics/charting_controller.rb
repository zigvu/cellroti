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
      # ensure that client can access page
      clientAllowedSeasonIds = @client.settings.getSeasonsAllowed
      @clientAllowedDetGroupIds = @client.det_groups.pluck(:id)

      # if the client doesn't have any seasons assigned, redirect to root with error
      if clientAllowedSeasonIds.count <= 0
        redirect_to root_path, alert: "No season data found - please contact Zigvu support"
      end
      # if client doesn't have any allowed det groups assigned, redirect to root with error
      if @clientAllowedDetGroupIds.count <= 0
        redirect_to root_path, alert: "No brand group data found - please contact Zigvu support"
      end

      # ensure that user has right settings
      userSettings = current_user.settings

      seasonId = userSettings.getSeasonAnalysisSeasonId.first
      @gameId = userSettings.getSeasonAnalysisGameId.first
      @detGroupIds = userSettings.getSeasonAnalysisDetGroupIds

      # update seasonId setting if necessary
      if not seasonId
        seasonId = clientAllowedSeasonIds.first
        userSettings.replaceSeasonAnalysisSeasonId(seasonId)
      end
      @season = ::Season.find(seasonId)

      # do nothing for updating @gameId

      # update detGroupIds setting if necessary
      if @detGroupIds.count < 2
        @detGroupIds = [@detGroupIds + @clientAllowedDetGroupIds[0..2]].flatten.uniq
        userSettings.replaceSeasonAnalysisDetGroupIds(@detGroupIds)
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
