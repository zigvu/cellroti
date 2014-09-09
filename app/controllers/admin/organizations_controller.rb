module Admin
  class OrganizationsController < ApplicationController
    authorize_actions_for ::Organization
    
    before_filter :ensure_html_format
    before_action :set_organization, only: [:edit, :update, :destroy]

    # GET /organizations
    def index
      @organizations = ::Organization.all
    end

    # GET /organizations/new
    def new
      @organization = ::Organization.new
      10.times { @organization.detectables.build}
    end

    # GET /organizations/1/edit
    def edit
      4.times { @organization.detectables.build}
    end

    # POST /organizations
    def create
      @organization = ::Organization.new(organization_params)
      if @organization.save
        redirect_to admin_organizations_url, notice: 'Organization was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /organizations/1
    def update
      if @organization.update(organization_params)
        redirect_to admin_organizations_url, notice: 'Organization was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /organizations/1
    def destroy
      @organization.destroy
      redirect_to admin_organizations_url
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_organization
        @organization = ::Organization.find(params[:id])
      end

      # Never trust parameters from the scary internet, only allow the white list through.
      def organization_params
        params.require(:organization).permit(:name, :industry, 
          detectables_attributes: [:id, :name, :pretty_name, :description, :_destroy])
      end
  end
end