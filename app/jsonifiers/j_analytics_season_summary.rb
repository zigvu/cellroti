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
					start_date: game.start_date, venue_city: game.venue_city, 
					venue_stadium: game.venue_stadium
				}
			end

			retHash[:sub_season] = getSubSeason()

			return retHash.to_json
		end

		def getSubSeason
			subSeasons = []
			@season.sub_seasons.each do |subSeason|
				subSeasons << {
					subseason_id: subSeason.id,
					subseason_name: subSeason.name,
					game_ids: subSeason.games.pluck(:id)
				}
			end
			subSeasons
		end

	end
end
