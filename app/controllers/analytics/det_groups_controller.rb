module Analytics
  class DetGroupsController < ApplicationController
    authorize_actions_for ::DetGroup

    before_action :set_det_group, only: [:show, :edit, :update, :destroy]
    before_action :set_client

    # GET /det_groups
    def index
      @det_groups = @client.det_groups
    end

    # GET /det_groups/new
    def new
      @det_group = ::DetGroup.new
      @client.detectables.each do |d|
        @det_group.det_group_detectables.build(detectable: d)
      end
    end

    # GET /det_groups/1/edit
    def edit
      (@client.detectables - @det_group.detectables).each do |d|
        @det_group.det_group_detectables.build(detectable: d)
      end
    end

    # POST /det_groups
    def create
      @det_group = ::DetGroup.new(det_group_params)

      if @det_group.save
        redirect_to analytics_det_groups_url, notice: 'Group was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /det_groups/1
    def update
      if @det_group.update(det_group_params)
        redirect_to analytics_det_groups_url, notice: 'Group was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /det_groups/1
    def destroy
      @det_group.destroy
      redirect_to analytics_det_groups_url, notice: 'Group was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_det_group
        @det_group = ::DetGroup.find(params[:id])
      end

      def set_client
        @client = current_user.client
      end

      # Only allow a trusted parameter "white list" through.
      def det_group_params
        params.require(:det_group).permit(:name, :client_id, 
          det_group_detectables_attributes: [:id, :detectable_id, :_destroy])
      end
  end
end