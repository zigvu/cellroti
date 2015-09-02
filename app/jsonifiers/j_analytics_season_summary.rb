module Jsonifiers
	class JAnalyticsSeasonSummary < Jsonifiers::JAnalytics
		def initialize(season)
			@season = season
			@cacheKey = "#{@season.cache_key}/JAnalyticsSeasonSummary"
		end

		def to_json
			retJSON = Rails.cache.fetch(@cacheKey) do 
				getSeasonSummary()
			end
		end

		def getSeasonSummary
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
					venue_stadium: game.venue_stadium,
					sequence_counters: getGameSequenceCounters(game)
				}
			end

			retHash[:sub_seasons] = []
			@season.sub_seasons.each do |subSeason|
				retHash[:sub_seasons] << {
					id: subSeason.id,
					name: subSeason.name,
					game_ids: subSeason.games.pluck(:id)
				}
			end

			return retHash.to_json
		end

		def getGameSequenceCounters(game)
			sequenceCounters = []
			summaryMetric = SummaryMetric
				.in(video_id: game.videos.pluck(:id))
				.where(resolution_seconds: States::SummaryResolutions.finestGameResolution)
				.first

			# in case when video has been processed
			if summaryMetric != nil
				# TODO: update when we have multipe videos in a game
				firstSingleSummaryMetrics = summaryMetric.single_summary_metrics.first
				lastSingleSummaryMetrics = summaryMetric.single_summary_metrics.last
				sequenceCounters << {
					video_id: summaryMetric.video_id,
					begin_count: firstSingleSummaryMetrics.sequence_counter,
					end_count: lastSingleSummaryMetrics.sequence_counter,
					begin_time: firstSingleSummaryMetrics.frame_time,
					end_time: lastSingleSummaryMetrics.frame_time
				}
			else
				sequenceCounters << {
					video_id: 0,
					begin_count: 0,
					end_count: -1,
					begin_time: 0,
					end_time: 0
				}
			end
			sequenceCounters
		end

	end
end
