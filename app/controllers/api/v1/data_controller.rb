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
    # update video and kick off delayed_job

    # send success
    render json: {success: "Kicked off delayed job for video"}
  end

end
