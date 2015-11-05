module Admin
  class DetGroupsController < ApplicationController
    authorize_actions_for ::Organization

    before_filter :ensure_html_format
    before_action :set_det_group, only: [:edit, :update, :destroy]

    # GET /det_groups
    def index
      @det_groups = ::DetGroup.all
    end

    # GET /det_groups/new
    def new
      @det_group = ::DetGroup.new
      ::Detectable.all.each do |d|
        @det_group.det_group_detectables.build(detectable: d)
      end
    end

    # GET /det_groups/1/edit
    def edit
      # NOTE: currently assumes that detectables in det_group cannot be changed
    end

    # POST /det_groups
    def create
      statusSuccess, notice = validate_det_group_duplication(det_group_params)

      if statusSuccess
        @det_group = ::DetGroup.new(det_group_params)
        if @det_group.save
          # kick off metrics creation
          status = Services::DetGroupAnalyticsService.new(::Client.zigvu_client, @det_group).create()
          if status
            notice = 'Group was successfully created. Check progress of metrics computation'
          else
            statusSuccess = false
            notice = 'Group was successfully created but metrics computation could not begin'
          end
        else
          statusSuccess = false
          notice = 'Fail: Database save - are any fields duplicate/blank?'
        end
      end

      if not statusSuccess
        redirect_to admin_det_groups_url, alert: notice
      else
        redirect_to admin_det_groups_url, notice: notice
      end
    end

    # PATCH/PUT /det_groups/1
    def update
      # NOTE: currently assumes that detectables in det_group cannot be changed
      if @det_group.update(det_group_params)
        redirect_to admin_det_groups_url, notice: 'Group was successfully updated.'
      else
        redirect_to admin_det_groups_url, alert: 'Fail: Database save - are any fields duplicate/blank?'
      end
    end

    # DELETE /det_groups/1
    def destroy
      # destroy associated jobs
      Services::DetGroupAnalyticsService.new(::Client.zigvu_client, @det_group).destroy()
      # and destroy the det group itself
      @det_group.destroy
      redirect_to admin_det_groups_url, notice: 'Group was successfully deleted.'
    end

    private
      # validate that this record can be created/updated
      def validate_det_group_duplication(params, curDetGroup = nil)
        statusSuccess = true
        notice = nil

        detectableIds = get_detectable_ids(params)

        # no detectables selected
        if detectableIds.count == 0
          statusSuccess = false
          notice = "Fail: At least 1 detectable needs to be selected"
        end

        # no detectable combination is present
        if statusSuccess
          alreadyPresent, presentDetGroup = find_duplicate_detectables(detectableIds, curDetGroup)
          if alreadyPresent
            statusSuccess = false
            notice = "Fail: BrandGroup '#{presentDetGroup.name}' already has all selected detectables"
          end
        end
        return statusSuccess, notice
      end

      # get detectable ids from params
      def get_detectable_ids(params)
        detectableIds = det_group_params["det_group_detectables_attributes"].map{
          |k, v| v["detectable_id"] if v["_destroy"] == "0"
        }
        detectableIds = (detectableIds.uniq - [nil]).map{|k| k.to_i}.sort
        return detectableIds
      end


      # see if detectables in det_group is already present in another det_group
      def find_duplicate_detectables(detectableIds, curDetGroup)
        alreadyPresent = false
        presentDetGroup = nil
        (::DetGroup.all - [curDetGroup]).each do |dg|
          if dg.detectables.pluck(:id).sort == detectableIds
            alreadyPresent = true
            presentDetGroup = dg
            break
          end
        end
        return alreadyPresent, presentDetGroup
      end

      # Use callbacks to share common setup or constraints between actions.
      def set_det_group
        @det_group = ::DetGroup.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def det_group_params
        params.require(:det_group).permit(:name, :pretty_name, 
          det_group_detectables_attributes: [:id, :detectable_id, :_destroy])
      end
  end
end