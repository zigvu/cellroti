module Sprt
  class GamesController < ApplicationController
    authorize_actions_for ::Game

    before_action :set_game, only: [:show, :edit, :update, :destroy]
    before_action :set_season, only: [:new, :edit, :create, :update]

    # GET /games/1
    def show
      @videos = @game.videos
      @events = @game.events
    end

    # GET /games/new
    def new
      @game = ::Game.new
      2.times { @game.game_teams.build}
    end

    # GET /games/1/edit
    def edit
      2.times { @game.game_teams.build}
    end

    # POST /games
    def create
      @game = ::Game.new(game_params)

      if @game.save
        redirect_to sprt_season_url(@season), notice: 'Game was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /games/1
    def update
      if @game.update(game_params)
        redirect_to sprt_season_url(@season), notice: 'Game was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /games/1
    def destroy
      @game.destroy
      redirect_to sprt_sports_url, notice: 'Game was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_game
        @game = ::Game.find(params[:id])
      end

      def set_season
        if params[:season_id] != nil
          @season = ::Season.find(params[:season_id])
        elsif params[:game][:season_id] != nil
          @season = ::Season.find(params[:game][:season_id])
        else
          raise RuntimeError("Season ID not available")
        end
      end

      # Only allow a trusted parameter "white list" through.
      def game_params
        params.require(:game).permit(:name, :description, :start_date, :end_date, :venue_city, 
          :venue_stadium, :season_id, game_teams_attributes: [:id, :team_id, :_destroy])
      end
  end
end