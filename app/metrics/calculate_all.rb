module Metrics
	class CalculateAll

		def initialize(video)
			@video = video
			@mcr = Metrics::MetricsConfigReader.new

			@mongoBatchInsertSize = @mcr.g_mongoBatchInsertSize
		end

		def calculate_all(detGroupIds, allDetections)
			# first ingest raw data into detectable metrics
			setup_initial_ingest(allDetections)
			ingest_raw_data()
			calculate_metrics_only(detGroupIds)
		end

		def calculate_metrics_only(detGroupIds)
			# calculate det groups
			setup_det_group_calculations(detGroupIds)
			det_group_calculate()
			# finally calculate metrics
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
				mcsd[detectableId] = Metrics::CalculateSingleDetectable.new(@mcr, @video, detectableId)
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

					# STORE: raw data
					# Note: this is tied to schema in SingleRawDetection class
					singleRawDetections << { di: detectableId, de: detections }

					# STORE: detectables
					singleDetectableMetrics += mcsd[detectableId].calculate(frameTime, detections)
				end
				# STORE: frame detection
				# Note: this is tied to schema in FrameDetection class
				frameDetections << {
					fn: frameNumber,
					ft: frameTime,
					single_raw_detections: singleRawDetections,
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
			FrameDetection.create_indexes

			return true
		end

		def setup_det_group_calculations(detGroupIds)
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


		def det_group_calculate
			# hold objects for single detectable metrics calculation
			mcsdg = {}
			@detGroupIds.each do |dgId|
				mcsdg[dgId] = Metrics::CalculateSingleDetGroup.new(@mcr, @video, dgId)
			end

			# has to store det group metrics by frame number
			frameCounter = 0
			detGroupMetricsHash = {}

			@frameDetections.each do |frameDetection|
				frameNumber = frameDetection.frame_number
				singleDetectableMetrics = frameDetection.single_detectable_metrics

				# array to hold det group computation
				detGroupMetricsHash[frameNumber] = []
				@detGroupIds.each do |dgId|
					detGroupMetricsHash[frameNumber] << mcsdg[dgId].calculate(singleDetectableMetrics)
				end

				# write to db in batches
				frameCounter += 1
				if frameCounter >= @mongoBatchInsertSize
					write_dgm_using_moped(detGroupMetricsHash)
					frameCounter = 0
					detGroupMetricsHash = {}
				end
			end

			# write the last batch to db
			if frameCounter > 0
				write_dgm_using_moped(detGroupMetricsHash)
			end

			return true
		end

		# write using moped driver - individual writes are slow
		def write_dgm_using_moped(detGroupMetricsHash)
			@session = @session || Mongoid.default_session
			updates = []
			detGroupMetricsHash.each do |frameNumber, dgm|
				updates << {
					'q' => {'fn' => frameNumber},
					'u' => {
						'$push' => {
							'single_det_group_metrics' => {
								'$each' => dgm
							}
						}
					},
					'multi' => true
				}
			end
			@session.command({
				update: FrameDetection.collection_name.to_s,
				updates: updates,
				ordered: false 
			})
		end

		def setup_summary_metrics_calculations(detGroupIds)
			@detGroupIds = detGroupIds

			# sanity check
			videoDetection = @videoDetection || @video.video_detections.first
			raise "Video has no detections saved" if videoDetection == nil

			@frameDetections = @frameDetections || videoDetection.frame_detections.order_by([:frame_number, :asc])
			raise "Video has no frame detections saved" if @frameDetections.count == 0

			evaluatedDetGroups = @frameDetections.first.single_det_group_metrics.pluck(:det_group_id)

			@detGroupIds.each do |dgId|
				raise "Video is not evaluated against det group #{dgId}" if not evaluatedDetGroups.include?(dgId)
			end
		end

		def summary_metrics_calculate
			# hold objects for single detectable metrics calculation
			mcss = {}
			@detGroupIds.each do |dgId|
				mcss[dgId] = Metrics::CalculateSingleSummary.new(@mcr, @video, dgId)
				mcss[dgId].setup_data_structures()
			end

			# note that database write happens inside CalculateSingleSummary class
			@frameDetections.each do |frameDetection|
				@detGroupIds.each do |dgId|
					mcss[dgId].addFrameData(frameDetection)
				end
			end

			@detGroupIds.each do |dgId|
				mcss[dgId].finalize_calculations()
			end

			# create indexes if not there yet
			SummaryMetric.create_indexes
			SingleSummaryMetric.create_indexes
		end

	end
end