module Admin
  class DetGroupsController < ApplicationController
    before_action :set_det_group, only: [:show, :edit, :update, :destroy]

    # GET /det_groups
    def index
      @det_groups = ::DetGroup.all
    end

    # GET /det_groups/1
    def show
    end

    # GET /det_groups/new
    def new
      @det_group = ::DetGroup.new
    end

    # GET /det_groups/1/edit
    def edit
    end

    # POST /det_groups
    def create
      @det_group = ::DetGroup.new(det_group_params)

      if @det_group.save
        redirect_to @det_group, notice: 'Det group was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /det_groups/1
    def update
      if @det_group.update(det_group_params)
        redirect_to @det_group, notice: 'Det group was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /det_groups/1
    def destroy
      @det_group.destroy
      redirect_to det_groups_url, notice: 'Det group was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_det_group
        @det_group = ::DetGroup.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def det_group_params
        params.require(:det_group).permit(:name, :user_id)
      end
  end
end