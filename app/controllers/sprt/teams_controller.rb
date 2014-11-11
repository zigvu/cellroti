module Sprt
  class TeamsController < ApplicationController
    authorize_actions_for ::Team

    before_filter :ensure_html_format
    before_action :set_team, only: [:show, :edit, :update, :destroy]
    before_action :set_league, only: [:new, :edit, :create, :update]

    # GET /teams/1
    def show
    end

    # GET /teams/new
    def new
      @team = ::Team.new
    end

    # GET /teams/1/edit
    def edit
    end

    # POST /teams
    def create
      @team = ::Team.new(team_params)

      if @team.save
        redirect_to sprt_league_url(@league), notice: 'Team was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /teams/1
    def update
      if @team.update(team_params)
        redirect_to sprt_league_url(@league), notice: 'Team was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /teams/1
    def destroy
      @team.destroy
      redirect_to sprt_sports_url, notice: 'Team was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_team
        @team = ::Team.find(params[:id])
      end

      def set_league
        if params[:league_id] != nil
          @league = ::League.find(params[:league_id])
        elsif params[:team][:league_id] != nil
          @league = ::League.find(params[:team][:league_id])
        else
          raise "League ID not available"
        end
      end

      # Only allow a trusted parameter "white list" through.
      def team_params
        params.require(:team).permit(:name, :description, :icon_path, :league_id)
      end
  end
end