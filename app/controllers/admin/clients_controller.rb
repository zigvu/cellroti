module Admin
  class ClientsController < ApplicationController
    authorize_actions_for ::Client
    authority_actions :manage_users => :update

    before_filter :ensure_html_format
    before_action :set_client, only: [:manage_users, :show, :edit, :update, :destroy]

    # GET /clients
    def index
      @clients = ::Client.all
    end

    # GET /clients/1
    def manage_users
    end

    # GET /clients/1
    def show
      (::Detectable.all - @client.detectables).each do |d|
        @client.client_detectables.build(detectable: d)
      end
    end

    # GET /clients/new
    def new
      @client = ::Client.new
    end

    # GET /clients/1/edit
    def edit
    end

    # POST /clients
    def create
      @client = ::Client.new(client_params)

      if @client.save
        redirect_to [:admin, @client], notice: 'Client was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /clients/1
    def update
      if @client.update(client_params)
        redirect_to [:admin, @client], notice: 'Client was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /clients/1
    def destroy
      @client.destroy
      redirect_to admin_clients_url
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_client
        @client = ::Client.find(params[:id])
      end

      # Never trust parameters from the scary internet, only allow the white list through.
      def client_params
        params.require(:client).permit(:name, :pretty_name, 
          :description, :client_setting_id, :organization_id, 
          client_detectables_attributes: [:id, :detectable_id, :_destroy])
      end
  end
end