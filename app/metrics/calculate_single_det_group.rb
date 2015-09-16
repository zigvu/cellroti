module Metrics
	class CalculateSingleDetGroup
		def initialize(configReader, video, detGroupId)
			@configReader = configReader
			@video = video
			@detGroupId = detGroupId

			@detectableIds = DetGroup.find(detGroupId).detectables.pluck(:id)

			@be_detGroupCrowdingWeight = @configReader.dgm_be_detGroupCrowding
			@be_visualSaliencyWeight = @configReader.dgm_be_visualSaliency
			@be_timingEffectivenessWeight = @configReader.dgm_be_timingEffectiveness
			@be_spatialEffectivenessWeight = @configReader.dgm_be_spatialEffectiveness

			# view persistence
			@timeForSingleFrame = States::ConfigReader.frameTimeStampResolution / @video.detection_frame_rate
			@vp_numOfDetectedFrames = 0
		end

		def calculate(singleDetectableMetrics)
			# NOTE: although the whole array of singleDetectableMetrics
			# is passed here, only those present in @detectableIds is used
			# when doing arithmetic operations - thus simplifying data passing

			# calculate individual metrics
			detGroupCrowding = det_group_crowding(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :det_group_crowding)])

			visualSaliency = visual_saliency(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :visual_saliency)])

			timingEffectiveness = timing_effectiveness(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :timing_effectiveness)])

			spatialEffectiveness = spatial_effectiveness(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :spatial_effectiveness)])

			viewDuration = view_duration(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :view_duration)])

			viewPersistence = view_persistence(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :view_persistence)])

			quadrantsCount = quadrants_count(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :quadrants)])

			# final rolled-up metrics
			brandEffectiveness = (
				@be_detGroupCrowdingWeight   * detGroupCrowding +
				@be_visualSaliencyWeight       * visualSaliency +
				@be_timingEffectivenessWeight  * timingEffectiveness +
				@be_spatialEffectivenessWeight * spatialEffectiveness
			)

			# Note: this is tied to schema in SingleDetGroupMetric class
			sdgm = ::SingleDetGroupMetric.new
			sdgm.det_group_id = @detGroupId
			sdgm.brand_effectiveness = brandEffectiveness
			sdgm.det_group_crowding = detGroupCrowding
			sdgm.visual_saliency = visualSaliency
			sdgm.timing_effectiveness = timingEffectiveness
			sdgm.spatial_effectiveness = spatialEffectiveness
			sdgm.view_duration = viewDuration
			sdgm.view_persistence = viewPersistence
			sdgm.quadrants = quadrantsCount

			return sdgm
		end

		# for det_group_crowding
		def det_group_crowding(detGroupCrowdingHash)
			detGroupCrowding = 0
			allGroupArea = detGroupCrowdingHash.collect{|k,v| v}.sum

			detGroupArea = operate_det_hash(detGroupCrowdingHash, :sum)

			if allGroupArea > 0
				detGroupCrowding = detGroupArea/allGroupArea
			end
			return detGroupCrowding
		end

		def visual_saliency(visualSaliencyHash)
			return operate_det_hash(visualSaliencyHash, :max)
		end

		# for timing_effectiveness
		def timing_effectiveness(eventScoresHash)
			return operate_det_hash(eventScoresHash, :max)
		end

		def spatial_effectiveness(spatialEffectivenessHash)
			return operate_det_hash(spatialEffectivenessHash, :max)
		end

		def view_duration(viewDurationHash)
			return operate_det_hash(viewDurationHash, :max)
		end

		def view_persistence(viewPersistenceHash)
			# values from viewPersistenceHash:
			# 0 - no detectable present this frame
			# 1 - detectable present this frame

			hasDetection = viewPersistenceHash.collect{|k,v| v}.max > 0

			persistence = 0
			if @vp_numOfDetectedFrames > 0
				if hasDetection
					@vp_numOfDetectedFrames += 1
				else
					# reset
					persistence = @vp_numOfDetectedFrames
					@vp_numOfDetectedFrames = 0
				end
			else
				if hasDetection
					@vp_numOfDetectedFrames += 1
				end
			end

			return persistence * @timeForSingleFrame
		end

		def quadrants_count(quadrantsCountHash)
			qdTotal = {}
			@detectableIds.each_with_index do |dId, idx|
				if idx == 0
					quadrantsCountHash[dId].each do |k, v|
						qdTotal[k] = v
					end
				else
					quadrantsCountHash[dId].each do |k, v|
						qdTotal[k] += v
					end
				end
			end
			# note: do not average since if multiple detectable/detections
			# present, we want heatmap chart to glow brighter
			return qdTotal
		end

		def operate_det_hash(inputHash, opMethod)
			output = 0

			@detectableIds.each do |dId|
				if opMethod == :max
					output = [output, inputHash[dId]].max
				elsif (opMethod == :sum) || (opMethod == :average)
					output += inputHash[dId]
				else
					raise "Unknown method to operate on hash"
				end
			end
			if opMethod == :average
				output /= @detectableIds.count if @detectableIds.count > 0
			end
			#puts "#{detGroupId}: #{@detectableIds} : #{output}"
			return output
		end

	end
end