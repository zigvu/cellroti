class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :authenticate_user!

  # ensure HTML format
  def ensure_html_format
    if request.format != Mime::HTML
      raise ActionController::RoutingError, "Format #{params[:format].inspect} not supported for #{request.path.inspect}"
    end
  end

  # ensure JSON format
  def ensure_json_format
    if request.format != Mime::JSON
      raise ActionController::RoutingError, "Format #{params[:format].inspect} not supported for #{request.path.inspect}"
    end
  end
end
