
module Jsonifiers
	class MultiPackager < Jsonifiers::JAnalytics
		def initialize(gameIds, detGroupIds, summaryResolution)
			@gameIds = gameIds.sort
			@detGroupIds = detGroupIds.sort
			@summaryResolution = summaryResolution
		end

		# NOTE: This function uses a LOT of in-place string concatenation
		# if changing, double check for bugs!
		def getData
			# add data keys
			retJSON = getHashJSON('brand_group_data_keys', Jsonifiers::GameDetGroupPackager.brand_group_data_keys)
			retJSON.chomp!('}')
			retJSON << ","

			# add game events for a single game case
			if @gameIds.count == 1
				gameEvents = Jsonifiers::GameEventsPackager.new(
					Game.find(@gameIds.first), @summaryResolution).eventsJSON()
				retJSON << gameEvents.reverse!.chomp!('{').reverse!
			else
				gameEvents = getHashJSON('game_events', nil)
				retJSON << gameEvents.reverse!.chomp!('{').reverse!
			end
			retJSON.chomp!('}')

			brandGroupMap = Jsonifiers::DetGroupPackager.new(@detGroupIds).detGroupNameJSON()
			retJSON << ', "brand_group_map": ' << brandGroupMap << ","

			# concatenate string data for each game
			gameData = '"ndx_data":['
			@gameIds.each do |gameId|
				gd = '{"game_id": ' << "#{gameId}" << ', "game_data": ['
				@detGroupIds.each do |detGroupId|
					dj = Jsonifiers::GameDetGroupPackager.new(
							Game.find(gameId), 
							DetGroup.find(detGroupId), 
							@summaryResolution
						).dataJSON()
					#dj = [1].to_json
					gd << '{"brand_group_id": ' << "#{detGroupId}" << ', "data": ' << dj << '},'
				end
				gd.chomp!(',')
				sj = Jsonifiers::GameDetGroupPackager.sequenceJSON(Game.find(gameId))

				gd << '], "game_counters": ' << sj << "},"
				gameData << gd
			end
			gameData.chomp!(',')
			gameData << ']'			

			retJSON << gameData
			retJSON << '}'
			return retJSON
		end

		def getHashJSON(hashName, hashData)
			if hashData == nil
				return {hashName => {}}.to_json
			else
				return {hashName => hashData}.to_json
			end
		end

	end
end
