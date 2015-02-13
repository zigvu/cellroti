module Jsonifiers
	class JAnalyticsSeasonSummary < Jsonifiers::JAnalytics
		def initialize(season)
			@season = season
			@cacheKey = "#{@season.cache_key}/JAnalyticsSeasonSummary"
		end

		def to_json
			return getSeasonSummary()
		end

		def getSeasonSummary
			raise 'Need a cache key for JAnalyticsSeasonSummary class' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				getSeasonSummary_NonChached()
			end
		end

		def getSeasonSummary_NonChached
			retHash = {}
			retHash[:id] = @season.id
			retHash[:name] = @season.name
			retHash[:league] = @season.league.name
			retHash[:sport] = @season.league.sport.name

			retHash[:event_types] = []
			@season.league.sport.event_types.each do |et|
				retHash[:event_types] << {id: et.id, name: et.name, description: et.description}
			end

			retHash[:teams] = []
			@season.league.teams.each do |team|
				retHash[:teams] << {id: team.id, name: team.name}
			end
			
			retHash[:games] = []
			@season.games.each do |game|
				retHash[:games] << {
					id: game.id, name: game.name, teams: game.teams.pluck(:id), 
					start_date: game.start_date, end_date: game.end_date, 
					venue_city: game.venue_city, venue_stadium: game.venue_stadium}
			end

			retHash[:sub_season] = getSubSeason_Dummy()

			return retHash.to_json
		end

		def getSubSeason_Dummy
			return [
			{
        subseason_id: 1,
        subseason_name: 'Group A',
        game_ids: [1,2,3, 4,5,6]
      },
			{
        subseason_id: 2,
        subseason_name: 'Group B',
        game_ids: [7,8,9, 10,11,12]
      },
			{
        subseason_id: 3,
        subseason_name: 'Group C',
        game_ids: [13,14,15, 16,17,18]
      },
			{
        subseason_id: 4,
        subseason_name: 'Group D',
        game_ids: [19,20,21, 22,23,24]
      },
			{
        subseason_id: 5,
        subseason_name: 'Group E',
        game_ids: [25,26,27, 28,29,30]
      },
			{
        subseason_id: 6,
        subseason_name: 'Group F',
        game_ids: [31,32,33, 34,35,36]
      },
			{
        subseason_id: 7,
        subseason_name: 'Group G',
        game_ids: [37,38,39, 40,41,42]
      },
			{
        subseason_id: 8,
        subseason_name: 'Group H',
        game_ids: [43,44,45, 46,47,48]
      },
			{
        subseason_id: 9,
        subseason_name: 'Round of 16',
        game_ids: [49,50,51,52, 53,54,55,56]
      },
      {
        subseason_id: 10,
        subseason_name: 'Quater Finals',
        game_ids: [57,58,59,60]
      },
      {
        subseason_id: 11,
        subseason_name: 'Semi Finals',
        game_ids: [61,62]
      },
      {
        subseason_id: 12,
        subseason_name: 'Third Place',
        game_ids: [63]
      },
      {
        subseason_id: 13,
        subseason_name: 'Final',
        game_ids: [64]
      }];
		end

	end
end
