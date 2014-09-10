class Api::V1::DetGroupsController < ApplicationController
  authorize_actions_for ::DetGroup

  before_filter :ensure_json_format
  before_action :set_det_group, only: [:show]
  before_action :set_client

  # GET /det_groups
  def index
    @det_groups = @client.det_groups
    render json: @det_groups.to_json
  end

  def show
    render json: @det_group.to_json
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_det_group
      @det_group = ::DetGroup.find(params[:id])
      authorize_action_for @det_group
    end

    def set_client
      @client = current_user.client
    end

    # Only allow a trusted parameter "white list" through.
    def det_group_params
      # params.require(:det_group).permit(:name, :user_id, 
      #   det_group_detectables_attributes: [:id, :detectable_id, :_destroy])
    end
end
