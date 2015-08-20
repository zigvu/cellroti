require 'json'

module Metrics
	class VideoDataImport
		def initialize(video)
			@video = video

			@videoDetection = nil
			@configReader = States::ConfigReader.new
			@frameDetectionDumper = Metrics::MongoCollectionDumper.new('FrameDetection')
		end

		def populate
			# These files are produced in kheer by: app/data_exporters/save_for_cellroti_export.rb

      mVideo = Managers::MVideo.new(@video)
      videoMetaDataFile = mVideo.get_video_meta_data_file
      detectableIdsFile = mVideo.get_detectable_ids_file
      eventsFile = mVideo.get_events_file
      localizationFile = mVideo.get_localization_file

      update_video(videoMetaDataFile)
      update_detectableIds(detectableIdsFile)
      update_events(eventsFile)
      update_localizations(localizationFile)
			update_frames_to_extract()
    end

		def update_video(videoMetaDataFile)
			videoMetaData = JSON.load(File.open(videoMetaDataFile))
			raise "Video attributes data not proper JSON" if videoMetaData.class != Hash
			va = videoMetaData['video_meta_data']

			playbackFR = va['playback_frame_rate'].to_f
			frameNumberStart = va['start_frame_number'].to_i
			frameNumberEnd = va['end_frame_number'].to_i
			length = (States::ConfigReader.frameTimeStampResolution * (
				frameNumberEnd - frameNumberStart)) / playbackFR

			@video.update(
				title: va['title'],
				source_type: va['source_type'],
				quality: va['quality'],
				length: length,
				playback_frame_rate: playbackFR,
				detection_frame_rate: va['detection_frame_rate'].to_f,
				start_frame_number: frameNumberStart,
				end_frame_number: frameNumberEnd,
				width: va['width'].to_i,
				height: va['height'].to_i,				
			)

			# if data for this video already exists, purge all old data
			@video.video_detections.each do |vd|
				vd.destroy
				# this will cascade and delete frame data as well
			end
			@video.summary_metrics.each do |sm|
				sm.destroy
			end

			# create new video detection
			@videoDetection = VideoDetection.create(video_id: @video.id)
			# create indexes if not there yet
			VideoDetection.create_indexes
		end

		def update_detectableIds(detectableIdsFile)
			detectableIdsData = JSON.load(File.open(detectableIdsFile))
			raise "Detectable Ids data not proper JSON" if detectableIdsData.class != Hash
			@allDetectableIds = detectableIdsData['detectable_ids'].map{ |d| d.to_i }

			@videoDetection.update(detectable_ids: @allDetectableIds)
		end

		def update_events(eventsFile)
			# { events: [{frame_number: [cellroti_event_type_id:, ]}, ]}
			eventsData = JSON.load(File.open(eventsFile))
			raise "Events data not proper JSON" if eventsData.class != Hash

    	playbackFR = @video.playback_frame_rate
			frameRateToMSFactor = States::ConfigReader.frameTimeStampResolution / playbackFR
			game = @video.game
			game.events.destroy_all
			eventsData['events'].each do |kv|
				frameNumber = kv.keys.first.to_i
				eventTypeIds = kv.values.first.map{ |s| s.to_i }
				frameTime = (frameNumber * frameRateToMSFactor).to_i
				eventTypeIds.each do |eventTypeId|
					game.events.create(event_type_id: eventTypeId, event_time: frameTime)
				end
			end
		end

    def update_localizations(localizationFile)
    	frameNumberStart = @video.start_frame_number
    	detectionFrameRate = @video.detection_frame_rate
    	playbackFR = @video.playback_frame_rate

			# initialize countainers
			@mcsd = {}
			@allDetectableIds.each do |detectableId|
				@mcsd[detectableId] = Metrics::CalculateSingleDetectable.new(
					@configReader, @video, detectableId)
			end
			@calculateFramesToExtract = Metrics::CalculateFramesToExtract.new(
				@configReader, @allDetectableIds, detectionFrameRate)
			@frameRateToMSFactor = States::ConfigReader.frameTimeStampResolution / playbackFR

			# Note: the \n placement is important since cellroti ingests line by line
			# i.e., cellroti uses line information to extract specific information.
			# Also note that detections are assumed to be ordered by frame_number
			# format: 
			# { localizations: [
			# 	{frame_number: {cellroti_det_id: [{bbox: {x, y, width, height}, score: float}, ], }, }, 
			# ]}
			totalNumOfLines = %x{wc -l < "#{localizationFile}"}.to_i
			currentFrameNumber = frameNumberStart
			File.foreach(localizationFile).with_index do |line, lineNum|
				if lineNum >= 1 and lineNum < (totalNumOfLines - 1)
					frameNumber, detections = getLocsHash(line)
					while currentFrameNumber < frameNumber
						add_detections(currentFrameNumber.to_i, {})
						currentFrameNumber += detectionFrameRate
					end
					add_detections(frameNumber.to_i, detections)
					currentFrameNumber += detectionFrameRate
				end
			end
			@frameDetectionDumper.finalize
    end

		def update_frames_to_extract
			framesToExtract = @calculateFramesToExtract.getFramesToExtract
			@videoDetection.update(extracted_frames: framesToExtract)
		end

		def add_detections(frameNumber, detections)
			singleDetectableMetrics = []

			# puts "Working on frame number: #{frameNumber}"
			frameTime = (frameNumber * @frameRateToMSFactor).to_i

			@allDetectableIds.each do |detectableId|
				# get detections or empty array if no detections
				dets = detections[detectableId] || []

				# STORE: detectables
				singleDetectableMetric = @mcsd[detectableId].calculate(frameTime, dets)
				singleDetectableMetrics << singleDetectableMetric

				@calculateFramesToExtract.addDetectableMetric(
					frameNumber, detectableId, singleDetectableMetric)
			end

			# STORE: frame detection
			# Note: this is tied to schema in FrameDetection class
			@frameDetectionDumper.add({
				fn: frameNumber,
				ft: frameTime,
				single_detectable_metrics: singleDetectableMetrics,
				video_detection_id: @videoDetection.id
			})
		end

		def getLocsHash(line)
			va = JSON.parse(line.chomp.chomp(','))
			frameNumber = va.keys.first.to_i
			detections = {}
			@allDetectableIds.each do |detectableId|
				detections[detectableId] = []
				dets = va.values.first[detectableId.to_s]
				if dets != nil
					dets.each do |det|
						detections[detectableId] << {
							score: det["score"].to_f,
							bbox: {
								x: det["bbox"]["x"].to_i,
								y: det["bbox"]["y"].to_i,
								width: det["bbox"]["width"].to_i,
								height: det["bbox"]["height"].to_i
							}
						}
					end
				end
			end
			return frameNumber, detections
		end

		# find all det groups that can be constructed from a set of detectable Ids
		def find_det_group_ids
			detGroupIds = []
			DetGroup.all.each do |dg|
				detGroupIncluded = true
				dg.detectables.pluck(:id).each do |dId|
					detGroupIncluded = false if not @allDetectableIds.include?(dId)
				end
				detGroupIds << dg.id if detGroupIncluded
			end
			return detGroupIds
		end

	end
end