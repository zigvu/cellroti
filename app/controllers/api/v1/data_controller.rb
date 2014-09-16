class Api::V1::DataController < ApplicationController
  authorize_actions_for ::Organization
  authority_actions :detectables => :update

  before_filter :ensure_json_format

  # GET /detectables
  def detectables
    @detectables = ::Detectable.all
    render json: @detectables.to_json(:only => [:id, :name, :pretty_name])
  end

  

end
