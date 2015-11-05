class Api::V1::DetGroupsController < ApplicationController
  authorize_actions_for ::DetGroup

  before_filter :ensure_json_format
  before_action :set_det_group, only: [:show]
  before_action :set_client

  # GET /brands/groups
  def index
    @det_groups = @client.det_groups
    render json: @det_groups.to_json(:only => [:id, :name])
  end

  # GET /brands/groups/1
  def show
    jadg = Jsonifiers::JAnalyticsDetGroup.new(@det_group)
    render json: jadg.to_json
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_det_group
      id = det_group_params[:id]
      @det_group = ::DetGroup.find(id)
      authorize_action_for @det_group
    end

    def set_client
      @client = current_user.client
    end

    # Only allow a trusted parameter "white list" through.
    def det_group_params
      params.permit(:id)
    end
end
