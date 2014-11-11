module Sprt
  class SeasonsController < ApplicationController
    authorize_actions_for ::Season

    before_filter :ensure_html_format
    before_action :set_season, only: [:show, :edit, :update, :destroy]
    before_action :set_league, only: [:new, :edit, :create, :update]

    # GET /seasons/1
    def show
      @games = @season.games
    end

    # GET /seasons/new
    def new
      @season = ::Season.new
    end

    # GET /seasons/1/edit
    def edit
    end

    # POST /seasons
    def create
      @season = ::Season.new(season_params)
      @league = ::League.find(params[:season][:league_id])
      if @season.save
        redirect_to sprt_league_url(@league), notice: 'Season was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /seasons/1
    def update
      if @season.update(season_params)
        redirect_to sprt_league_url(@league), notice: 'Season was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /seasons/1
    def destroy
      @season.destroy
      redirect_to sprt_sports_url, notice: 'Season was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_season
        @season = ::Season.find(params[:id])
      end

      def set_league
        if params[:league_id] != nil
          @league = ::League.find(params[:league_id])
        elsif params[:season][:league_id] != nil
          @league = ::League.find(params[:season][:league_id])
        else
          raise "League ID not available"
        end
      end

      # Only allow a trusted parameter "white list" through.
      def season_params
        params.require(:season).permit(:name, :description, :league_id)
      end
  end
end