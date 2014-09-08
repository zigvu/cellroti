module Admin
  class ClientsController < ApplicationController
    authorize_actions_for ::Client
    authority_actions :update_detectables => :update

    before_filter :ensure_html_format
    before_action :set_client, only: [:update_detectables, :show, :edit, :update, :destroy]

    # POST /clients/1/update_detectables
    def update_detectables
      mClient = Managers::MClient.new(@client)
      # get rid of empty selections from array
      detectable_ids = params[:client][:detectable_ids].map(&:to_i) - [0]
 
      if mClient.setDetectableIds(detectable_ids)
        redirect_to [:admin, @client], notice: 'Client was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # GET /clients
    def index
      @clients = ::Client.all
    end

    # GET /clients/1
    def show
      @dclient = @client.decorate
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
          :description, :client_setting_id, :organization_id, :detectable_ids => [])
      end
  end
end