require 'json'

module SeedHelpers
	class DummyDataPopulatorService
		def initialize(gameSeason, client)
			@gameSeason = gameSeason
			@client = client

			@detectableIds = [2,3,5,6]

			@event_type_ids = EventType.pluck(:id)
			@tempFolder = '/mnt/tmp'
			@frameStep = 5
			@avgFrameRate = 25
			@numGamesPerSubSeason = 5

			@rnd = Random.new(1234567890)
			@structureTypes = [:brokenSine, :random, :sine]
			@structureTypesIdx = 0
		end

		def createManyGames(numOfGames, averageLengthMS)
			counter = 0
			allGamesArr = []
			teamPerumtations = @gameSeason.league.teams.pluck(:id).permutation(2).to_a.shuffle!(random: @rnd)
			subSeason = nil
			teamPerumtations.each do |teamPerumtation|
				break if counter >= numOfGames
				team1 = Team.find(teamPerumtation[0])
				team2 = Team.find(teamPerumtation[1])
				startDate = Time.now - numOfGames.days + counter.days - 1.days
				lengthMS = [
					averageLengthMS + @rnd.rand((0.3 * averageLengthMS).to_i),
					averageLengthMS - @rnd.rand((0.3 * averageLengthMS).to_i)
				].sample(random: @rnd)

				if (counter % @numGamesPerSubSeason) == 0
					subSeason = @gameSeason.sub_seasons.create(name: "Auto SubSeason")
				end
				allGamesArr << {
					subSeason: subSeason,
					team1: team1,
					team2: team2,
					startDate: startDate,
					lengthMS: lengthMS
				}
				counter += 1
			end
			# run in prallel
			# numOfProcessors = `cat /proc/cpuinfo | grep processor | wc -l`.to_i
			# Parallel.each(allGamesArr) do |gd|
			# 	ActiveRecord::Base.connection.reconnect!
			# 	createGame(gd[:team1], gd[:team2], gd[:startDate], gd[:lengthMS])
			# end
			
			allGamesArr.each do |gd|
				createGame(gd[:subSeason], gd[:team1], gd[:team2], gd[:startDate], gd[:lengthMS])
			end
		end

		def createGame(subSeason, team1, team2, startDate, lengthMS)
			puts ""
			puts "Game: #{team1.name} vs. #{team2.name}; Start: #{startDate} Length: #{lengthMS}"
			# create game and associate team
			game = subSeason.games.create(
				name: "#{team1.name} vs. #{team2.name}", 
				description: "Auto-generated - #{team1.name}.#{team2.name}", 
				start_date: startDate, 
				venue_city: "Auto-generated - #{team1.name}.#{team2.name}", 
				venue_stadium: "Auto-generated - #{team1.name}.#{team2.name}")
			GameTeam.create(game_id: game.id, team_id: team1.id)
			GameTeam.create(game_id: game.id, team_id: team2.id)

			numOfFrames = (((lengthMS/1000) * @avgFrameRate).to_i / @frameStep).to_i

			video = game.videos.create()
			mVideo = Managers::MVideo.new(video)
			videoMetaDataFile = mVideo.get_video_meta_data_file
			detectableIdsFile = mVideo.get_detectable_ids_file
			eventsFile = mVideo.get_events_file
			localizationFile = mVideo.get_localization_file

			createVideoMetaData(
				videoMetaDataFile, "#{team1.name} vs. #{team2.name}", game.id, 1, numOfFrames
			)
			createDetectableIds(detectableIdsFile)
			createEvents(eventsFile, 10, numOfFrames)
			createLocalizationData(localizationFile, numOfFrames)

			# populate data
			mvdi = Metrics::VideoDataImport.new(video)
			mvdi.populate
			detGroupIds = mvdi.find_det_group_ids

			# compute all intermediate/final metrics and save
			cam = Metrics::CalculateAll.new(video)
			cam.calculate_all(detGroupIds)
		end

		def createTeams(countryList)
			league = @gameSeason.league
			countryList.each do |country|
				league.teams.create(name: "#{country}", description: "#{country} team")
			end
		end


		# modified from kheer:
		# app/data_exporters/save_data_for_cellroti_export.rb
		def createVideoMetaData(outputFile, videoTitle, gameId, channelId, numOfFrames)
			FileUtils::rm_rf(outputFile)

			startFrameNumber = 1
			endFrameNumber = numOfFrames * @frameStep

			formattedVideo = {
				kheer_video_id: 1,
				title: videoTitle,
				source_type: 'zigvu',
				quality: 'high',
				playback_frame_rate: @avgFrameRate,
				detection_frame_rate: @frameStep,
				game_id: gameId,
				channel_id: channelId,
				start_frame_number: startFrameNumber,
				end_frame_number: endFrameNumber,
				width: 1280,
				height: 720
			}
			File.open(outputFile, 'w') do |f|
				videoMetaData = {video_meta_data: formattedVideo}
				f.puts "#{videoMetaData.to_json}"
			end
			outputFile
		end


		# modified from kheer:
		# app/data_exporters/save_data_for_cellroti_export.rb
		def createDetectableIds(outputFile)
			FileUtils::rm_rf(outputFile)

			File.open(outputFile, 'w') do |f|
				detIds = {detectable_ids: @detectableIds}
				f.puts "#{detIds.to_json}"
			end
			outputFile
		end


		# modified from kheer:
		# app/data_exporters/save_data_for_cellroti_export.rb
		def createEvents(outputFile, numEvents, numOfFrames)
			FileUtils::rm_rf(outputFile)

			events = []
			for i in 0..(@rnd.rand(numEvents))
				eventTypeId = @event_type_ids.sample(random: @rnd)
				frameNumber = @rnd.rand(numOfFrames)
				events << {:"#{frameNumber}" => [eventTypeId]}
			end

			# { events: [{frame_number: [cellroti_event_type_id:, ]}, ]}
			File.open(outputFile, 'w') do |f|
				eventsFormatted = {events: events}
				f.puts "#{eventsFormatted.to_json}"
			end
			outputFile
		end


		# modified from kheer:
		# app/data_exporters/save_data_for_cellroti_export.rb
		def createLocalizationData(outputFile, numOfFrames)
			FileUtils::rm_rf(outputFile)

			# Note: Cellroti ingests this line-by-line assuming each line is valid JSON
			# Also note that localizations are assumed to be ordered by frame_number
			# format: 
			# { localizations: [
			# 	{frame_number: {cellroti_det_id: [{bbox: {x, y, width, height}, score: float}, ], }, }, 
			# ]}

			structureType = @structureTypes[@structureTypesIdx % @structureTypes.count]
			sdg = SeedHelpers::StructuredDataGenerator.new(structureType, numOfFrames, @frameStep, @rnd)
			sdg.setDetectableIds(@detectableIds)
			videoData = sdg.generate()
			@structureTypesIdx += 1

			firstLine = true
			File.open(outputFile, 'w') do |f|
				f.puts "{\"localizations\": ["
				videoData.each do |frameNumber, formattedLoc|
					formattedLine = {:"#{frameNumber}" => formattedLoc}.to_json
					if firstLine
						formattedLine = "  #{formattedLine}"
						firstLine = false
					else
						formattedLine = ",\n  #{formattedLine}"
					end
					f << formattedLine
				end
				f.puts "\n]}"
			end
			outputFile
		end

	end
end