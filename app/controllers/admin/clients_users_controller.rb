module Admin
  class ClientsUsersController < ApplicationController
    authorize_actions_for ::Client

    before_filter :ensure_html_format
    before_action :set_client
    before_action :set_user, only: [:show, :edit, :update, :destroy]

    # GET /clients/1/users
    def index
      @users = @client.users
      @invitedButNotAcceptedUserIds = @client.users.created_by_invite.invitation_not_accepted.pluck(:id)
    end

    # GET /clients/1/users/new
    def new
      @user = ::User.new
      @roles = States::Roles.getClientRoles()
      @selectedRoleId = ::Role.where(name: States::Roles.client_user).first.id
    end

    # GET /clients/1/users/1/edit
    def edit
      @roles = States::Roles.getClientRoles()
      @selectedRoleId = @user.roles.first.id
    end

    # POST /clients/1/users/1
    def create
      if ::User.where(email: user_params[:email]).count > 0
        redirect_to admin_client_users_path(@client), alert: "User with email #{user_params[:email]} already exists. No invitation sent."
      else
        usrP = user_params.merge({client_id: @client.id})
        newUser = User.invite!(usrP, current_user)
        newUserCount = @client.users.count

        newRole = ::Role.find(role_params[:role_id])
        newUser.update_role(newRole)
        
        redirect_to admin_client_users_path(@client), notice: "Invitation was successfully sent."
      end
    end

    # PATCH/PUT /clients/1/users/1
    def update
      # ensure that only client roles are passed
      @roles = States::Roles.getClientRoles()
      newRole = ::Role.find(role_params[:role_id])
      raise "Client cannot have non-client roles" if not @roles.include?(newRole)

      if @user.update(user_params) and @user.update_role(newRole)
        redirect_to admin_client_users_path(@client), notice: 'User was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /clients/1/users/1
    def destroy
      @user.destroy
      redirect_to admin_client_users_path(@client), notice: 'User was successfully deleted.'      
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_client
        @client = ::Client.find(params[:client_id])
        authorize_action_for @client
      end
      def set_user
        @user = ::User.find(params[:id])
        raise "User should belong to the same client" if @user.client != @client
      end

      # Never trust parameters from the scary internet, only allow the white list through.
      def user_params
        params.require(:user).permit(:first_name, :last_name, :email)
      end
      def role_params
        params.require(:role).permit(:role_id)
      end
  end
end