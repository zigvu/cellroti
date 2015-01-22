class Api::V1::DataController < ApplicationController
  authorize_actions_for ::Organization
  authority_actions :detectables => :update
  authority_actions :videos => :update

  before_filter :ensure_json_format
  skip_before_filter :verify_authenticity_token, :only => [:videos]

  # GET /detectables
  def detectables
    @detectables = ::Detectable.all
    render json: @detectables.to_json(:only => [:id, :name, :pretty_name])
  end

  # POST /videos
  # note: CSRF protection disabled
  def videos
    statusSuccess = false
    notice = "Couldn't parse request from cellroti"

    video = Video.find(data_params[:video_id].to_i)
    storeSuccess = data_params[:success]

    if storeSuccess
      # kick off metrics creation
      status = Services::VideoDataImportService.new(::Client.zigvu_client, video).create()
      #status = true
      if status
        statusSuccess = true
        notice = "Successfully put in delayed job queue"
      else
        notice = "Could not start delayed job"
      end
    end
    # update video and kick off delayed_job

    # send response
    renderJSON = statusSuccess ? {success: notice} : {failure: notice}
    render json: renderJSON
  end

  private
    # Only allow a trusted parameter "white list" through.
    def data_params
      params.permit(:format, :user_token, :user_email, :video_id, :success)
    end
end
