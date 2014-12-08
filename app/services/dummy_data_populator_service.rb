require 'json'

module Services
	class DummyDataPopulatorService
		def initialize(caffeDataFile, gameSeason, client)
			rawData = JSON.parse(File.read(caffeDataFile))
			@videoAttributes = rawData["video_attributes"]

			@gameSeason = gameSeason
			@client = client

			@caffeData = {}
			@caffeDataKeys = rawData["detections"].keys().map{|i| i.to_i}.sort
			@caffeDataKeys.each do |k|
				@caffeData[k] = rawData["detections"][k.to_s]
			end

			@event_type_ids = EventType.pluck(:id)
			@tempFile = '/mnt/tmp/videoTempJSON.json'
			@frameStep = @videoAttributes["detection_frame_rate"]
			@avgFrameRate = @videoAttributes["playback_frame_rate"]
		end

		def createManyGames(numOfGames, averageLengthMS)
			counter = 0
			allGamesArr = []
			teamPerumtations = @gameSeason.league.teams.pluck(:id).permutation(2).to_a.shuffle!
			teamPerumtations.each do |teamPerumtation|
				break if counter >= numOfGames
				team1 = Team.find(teamPerumtation[0])
				team2 = Team.find(teamPerumtation[1])
				startDate = Time.now - numOfGames.days + counter.days - 1.days
				lengthMS = [
					averageLengthMS + rand((0.3 * averageLengthMS).to_i),
					averageLengthMS - rand((0.3 * averageLengthMS).to_i)
				].sample

				allGamesArr << {
					team1: team1,
					team2: team2,
					startDate: startDate,
					lengthMS: lengthMS
				}

				counter += 1
			end
			# run in prallel
			numOfProcessors = `cat /proc/cpuinfo | grep processor | wc -l`.to_i
			allGamesArr.each_slice(numOfProcessors) do |group|
				group.map do |gd|
					Thread.new do
						createGame(gd[:team1], gd[:team2], gd[:startDate], gd[:lengthMS])
					end
				end.each(&:join)
			end
		end

		def createGame(team1, team2, startDate, lengthMS)
			puts ""
			puts "Game: #{team1.name} vs. #{team2.name}; Start: #{startDate} Length: #{lengthMS}"
			# create game and associate team
			game = @gameSeason.games.create(
				name: "#{team1.name} vs. #{team2.name}", 
				description: "Auto-generated - #{team1.name}.#{team2.name}", 
				start_date: startDate, 
				end_date: startDate + (lengthMS/1000).to_i.seconds, 
				venue_city: "Auto-generated - #{team1.name}.#{team2.name}", 
				venue_stadium: "Auto-generated - #{team1.name}.#{team2.name}")
			GameTeam.create(game_id: game.id, team_id: team1.id)
			GameTeam.create(game_id: game.id, team_id: team2.id)

			# attach some events
			for i in 0..(rand(10))
				team = [team1, team2].sample
				eventTypeId = @event_type_ids.sample
				game.events.create(
					event_type_id: eventTypeId, 
					team_id: team.id, 
					event_time: rand(lengthMS - 500) + 500)
			end

			# create video
			video = game.videos.create(
				title: "#{team1.name} vs. #{team2.name}", 
				description: "Game details",
				comment: "Auto-generated - #{team1.name}.#{team2.name}", 
				source_type: "youtube",
				source_url: "http://none-for-now",
				runstatus: "run-complete",
				start_time: game.start_date,
				end_time: game.end_date)

			@videoAttributes["length"] = lengthMS

			# generate data
			numOfFrames = (((lengthMS/1000) * @avgFrameRate).to_i / @frameStep).to_i
			videoData = generateVideoData(numOfFrames, @frameStep)

			saveData = {
				video_id: video.id,
				video_attributes: @videoAttributes,
				detections: videoData
			}
			File.open(@tempFile, "w") do |f|
				f.write(JSON.pretty_generate(saveData))
			end

			# populate data
			cdps = Services::CaffeDataProcessorService.new()
			cdps.populate(video, @tempFile)
		end

		def createTeams(countryList)
			league = @gameSeason.league
			countryList.each do |country|
				league.teams.create(name: "#{country}", description: "#{country} team")
			end
		end

		def generateVideoData(numOfFrames, frameStep)
			vd = {}
			counter = 1
			for i in 0..numOfFrames
				vd.merge!({ counter =>  nextRandomData()})
				counter += 5
			end
			return vd
		end

		def nextRandomData
			return @caffeData[@caffeDataKeys.sample]
		end

	end
end