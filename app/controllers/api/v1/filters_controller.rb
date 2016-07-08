class Api::V1::FiltersController < ApplicationController
  authorize_actions_for ::Filter
  authority_actions :discover_data => :read
  authority_actions :discover_summary => :read

  before_filter :ensure_json_format
  before_action :set_client
  before_action :set_filter

  # GET /filters/1
  def show
    render json: @filter.to_json
  end

  # GET /filters/1/discover_data
  def discover_data
    render json: Jsonifiers::JAnalyticsDiscoverData.new(@filter).to_json
  end

  # GET /filters/1/discover_summary
  def discover_summary
    render json: Jsonifiers::JAnalyticsDiscoverSummary.new(@filter).to_json
  end

  # PATCH/PUT /filters/1
  def update
    cbd = Time.at(filter_params[:cal_begin_date].to_i)
    ebd = Time.at(filter_params[:cal_end_date].to_i)
    @filter.update(cal_begin_date: cbd, cal_end_date: ebd)

    head :no_content
  end


  private
    # Use callbacks to share common setup or constraints between actions
    def set_client
      @client = current_user.client
    end
    def set_filter
      @filter = Filter.find(params[:id])
      "Raise cannot show filter for different user" if current_user.id != @filter.user_id
    end

    # Only allow a trusted parameter "white list" through.
    def filter_params
      params.require(:filter).permit(:cal_begin_date, :cal_end_date)
    end
end
