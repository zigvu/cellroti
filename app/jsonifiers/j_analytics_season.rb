module Jsonifiers
	class JAnalyticsSeason < Jsonifiers::JAnalytics
		def initialize(season)
			@season = season
			@cacheKey = "#{@season.cache_key}/JAnalyticsSeason"
		end

		def get_data_hash
			raise 'Need a cache key for JAnalyticsSeason class' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				get_data_hash_NonChached()
			end
		end		

		def get_data_hash_NonChached
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

			return retHash
		end

	end
end
