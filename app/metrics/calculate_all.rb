module Metrics
	class CalculateAll

		def initialize(video)
			@video = video
			@configReader = States::ConfigReader.new

			@mongoBatchInsertSize = @configReader.g_mongoBatchInsertSize
		end

		def calculate_all(detGroupIds, allDetections)
			# first ingest raw data into detectable metrics
			setup_initial_ingest(allDetections)
			ingest_raw_data()
			calculate_metrics_only(detGroupIds)
		end

		def calculate_metrics_only(detGroupIds)
			# calculate det_group_metrics and summary_metrics
			setup_summary_metrics_calculations(detGroupIds)
			summary_metrics_calculate()
		end

		def setup_initial_ingest(allDetections)
			# sanity check
			@videoDetection = @video.video_detections.first
			raise "Video has no detections saved" if @videoDetection == nil

			# set detections
			@allDetections = allDetections
			@allDetectableIds = @videoDetection.detectable_ids.map{|i| i.to_i}

			# sort detections by frame number
			@sortedFrameNums = @allDetections.keys.collect{|i| i.to_i}.sort

			@frameRateToMSFactor = 1000.0 / @video.playback_frame_rate
			return true
		end

		def ingest_raw_data
			# hold objects for single detectable metrics calculation
			mcsd = {}
			@allDetectableIds.each do |detectableId|
				mcsd[detectableId] = Metrics::CalculateSingleDetectable.new(@configReader, @video, detectableId)
			end

			# array to hold frame detections
			frameDetections = []

			@sortedFrameNums.each do |frameNumber|
				# array to hold intermediate compute
				singleRawDetections = []
				singleDetectableMetrics = []

				# puts "Working on frame number: #{frameNumber}"
				frameTime = (frameNumber * @frameRateToMSFactor).to_i

				@allDetectableIds.each do |detectableId|
					# get detections or empty array if no detections
					detections = @allDetections[frameNumber.to_s][detectableId.to_s] || []

					# STORE: detectables
					singleDetectableMetrics += mcsd[detectableId].calculate(frameTime, detections)
				end
				# STORE: frame detection
				# Note: this is tied to schema in FrameDetection class
				frameDetections << {
					fn: frameNumber,
					ft: frameTime,
					single_detectable_metrics: singleDetectableMetrics,
					video_detection_id: @videoDetection.id
				}

				# write to db in batches
				if frameDetections.count >= @mongoBatchInsertSize
					FrameDetection.collection.insert(frameDetections)
					frameDetections = []
				end
			end
			# write the last batch to db
			if frameDetections.count > 0
				FrameDetection.collection.insert(frameDetections)
			end

			# create indexes if not there yet
			FrameDetection.no_timeout.create_indexes

			return true
		end

		def setup_summary_metrics_calculations(detGroupIds)
			@detGroupIds = detGroupIds

			# sanity check
			videoDetection = @videoDetection || @video.video_detections.first
			raise "Video has no detections saved" if videoDetection == nil

			@frameDetections = videoDetection.frame_detections.order_by([:frame_number, :asc])
			raise "Video has no frame detections saved" if @frameDetections.count == 0

			allDetectableIds = @allDetectableIds || videoDetection.detectable_ids.map{|i| i.to_i}
			dgDetectableIds = []
			@detGroupIds.each do |dgId|
				dgDetectableIds += DetGroup.find(dgId).detectables.pluck(:id)
			end
			dgDetectableIds.each do |dId|
				raise "Video is not evaluated against some detectables" if not allDetectableIds.include?(dId)
			end
			return true
		end


		def summary_metrics_calculate
			mcsdg = {}
			mcss = {}
			@detGroupIds.each do |dgId|
				# hold objects for single det group metrics calculation
				mcsdg[dgId] = Metrics::CalculateSingleDetGroup.new(@configReader, @video, dgId)
				# hold objects for single summary metrics calculation
				mcss[dgId] = Metrics::CalculateSingleSummary.new(@configReader, @video, dgId)
				mcss[dgId].setup_data_structures()
			end

			@frameDetections.no_timeout.each do |frameDetection|
				frameNumber = frameDetection.frame_number
				frameTime = frameDetection.frame_time
				singleDetectableMetrics = frameDetection.single_detectable_metrics

				@detGroupIds.each do |dgId|
					singleDetGroupMetric = mcsdg[dgId].calculate(singleDetectableMetrics)
					singleDetGroupMetric.frame_number = frameNumber
					singleDetGroupMetric.frame_time = frameTime

					# note that database write happens inside CalculateSingleSummary class
					mcss[dgId].addFrameData(singleDetGroupMetric)
				end
			end

			@detGroupIds.each do |dgId|
				mcss[dgId].finalize_calculations()
			end

			# create indexes if not there yet
			SummaryMetric.no_timeout.create_indexes
			SingleSummaryMetric.no_timeout.create_indexes

			return true
		end

	end
end