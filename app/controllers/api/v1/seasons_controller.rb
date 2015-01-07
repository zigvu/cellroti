class Api::V1::SeasonsController < ApplicationController
  authorize_actions_for ::Season
  authority_actions :summary => :read

  before_filter :ensure_json_format
  before_action :set_season, only: [:show, :summary]
  before_action :set_client

  # GET /seasons
  def index
    @seasons = Season.all
    render json: @seasons.to_json(:only => [:id, :name])
  end

  # GET /seasons/1
  def show
    jas = Jsonifiers::JAnalyticsSeason.new(@season)
    render json: jas.to_json
  end

  # GET /seasons/1/summary
  def summary
    jasd = Jsonifiers::JAnalyticsSeasonData.new(@season, @client)
    render json: jasd.to_json
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
      params.permit(:id, :format)
    end
end
