class Api::Stream::StreamController < ApplicationController
  # devise still requires to be logged in
  authorize_actions_for ::Game

  before_filter :ensure_json_format
  skip_before_filter :verify_authenticity_token
  before_action :set_streamObj, only: [:show, :update, :destroy]

  # GET /sports
  def index
    @streamObjs = @streamObjKlass.where(streamObj_params)
    render json: @streamObjs.to_json
  end

  # GET /sports/1
  def show
    render json: @streamObj.to_json
  end

  # POST /sports
  def create
    @streamObj = @streamObjKlass.new(streamObj_params)
    if @streamObj.save
      render json: @streamObj.to_json
    else
      render json: @streamObj.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /sports/1
  def update
    if @streamObj.update(streamObj_params)
      head :no_content
    else
      render json: @streamObj.errors, status: :unprocessable_entity
    end
  end

  # DELETE /sports/1
  def destroy
    @streamObj.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_streamObj
      @streamObj = @streamObjKlass.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def streamObj_params
      # Note: adding these additional parameters to permit will result in rails
      # requiring them to be present as a field in the model - which we don't want
      # :id, :format, :user_email, :user_token
      params.permit(@streamObjParamsPermit)
    end
end
