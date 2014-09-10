module Sprt
  class EventsController < ApplicationController
    include EventsHelper

    authorize_actions_for ::Event

    before_filter :ensure_html_format
    before_action :set_event, only: [:show, :edit, :update, :destroy]
    before_action :set_game, only: [:new, :edit, :create, :update]
    before_action :create_times, only: [:new, :edit]

    # GET /events/new
    def new
      @event = ::Event.new
    end

    # GET /events/1/edit
    def edit
    end

    # POST /events
    def create
      @event = ::Event.new(event_params)

      if @event.save
        redirect_to sprt_game_url(@game), notice: 'Event was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /events/1
    def update
      print event_params
      if @event.update(event_params)
        redirect_to sprt_game_url(@game), notice: 'Event was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /events/1
    def destroy
      @event.destroy
      redirect_to sprt_sports_url, notice: 'Event was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_event
        @event = ::Event.find(params[:id])
      end

      def set_game
        if params[:game_id] != nil
          @game = ::Game.find(params[:game_id])
        elsif params[:event][:game_id] != nil
          @game = ::Game.find(params[:event][:game_id])
        else
          raise RuntimeError("Game ID not available")
        end
      end

      def create_times
        @allHours, @allMinutes, @allSeconds, @allMilliSeconds = create_all_times
      end

      # Only allow a trusted parameter "white list" through.
      def event_params
        params.require(:event).permit(:event_time, :event_type_id, :game_id, :team_id,
         :hours, :minutes, :seconds, :milliseconds)
        params[:event][:event_time] = times_to_milliseconds(
          params[:event][:hours], params[:event][:minutes], 
          params[:event][:seconds], params[:event][:milliseconds])
        params.require(:event).permit(:event_time, :event_type_id, :game_id, :team_id)
      end
  end
end