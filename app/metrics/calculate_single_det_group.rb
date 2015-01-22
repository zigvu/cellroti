module Metrics
	class CalculateSingleDetGroup
		def initialize(configReader, video, detGroupId)
			@configReader = configReader
			@video = video
			@detGroupId = detGroupId

			@detectableIds = DetGroup.find(detGroupId).detectables.pluck(:id)

			@swTemporalDetGroupCrowding = Metrics::MetricsSlidingWindow.new(
				@configReader.dgm_sw_size,
				@configReader.dgm_sw_decayValues)

			@swTimingEffectiveness = Metrics::MetricsSlidingWindow.new(
				@configReader.dgm_sw_size,
				@configReader.dgm_sw_decayValues)

			@spatialDetGroupCrowdingWeight = @configReader.dgm_cw_spatialDetGroupCrowding
			@temporalDetGroupCrowdingWeight = @configReader.dgm_cw_temporalDetGroupCrowding

			@be_detGroupCrowdingWeight = @configReader.dgm_be_detGroupCrowding
			@be_visualSaliencyWeight = @configReader.dgm_be_visualSaliency
			@be_timingEffectivenessWeight = @configReader.dgm_be_timingEffectiveness
			@be_spatialEffectivenessWeight = @configReader.dgm_be_spatialEffectiveness

		end

		def calculate(singleDetectableMetrics)
			# NOTE: although the whole array of singleDetectableMetrics
			# is passed here, only those present in @detectableIds is used
			# when doing arithmetic operations - thus simplifying data passing

			# calculate individual metrics
			spatialDetGroupCrowding = spatial_det_group_crowding(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :cumulative_area)])

			visualSaliency = visual_saliency(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :visual_saliency)])

			eventScores = max_event_score(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :event_score)])

			spatialEffectiveness = spatial_effectiveness(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :spatial_effectiveness)])

			detectionsCount = detections_count(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :detections_count)])

			quadrantsCount = quadrants_count(Hash[
				singleDetectableMetrics.pluck(:detectable_id, :quadrants)])

			# populate sliding window

			# spatial score of det_group in timeline
			@swTemporalDetGroupCrowding.add(spatialDetGroupCrowding)
			temporalDetGroupCrowding = @swTemporalDetGroupCrowding.get_decayed_average
			
			# score of events in timeline
			@swTimingEffectiveness.add(eventScores)
			timingEffectiveness = @swTimingEffectiveness.get_decayed_average

			# combined crowding scores - space and time
			detGroupCrowding = (
				(@spatialDetGroupCrowdingWeight * spatialDetGroupCrowding) + 
				(@temporalDetGroupCrowdingWeight * temporalDetGroupCrowding))

			# final rolled-up metrics
			brand_effectiveness = 
				@be_detGroupCrowdingWeight   * detGroupCrowding +
				@be_visualSaliencyWeight       * visualSaliency +
				@be_timingEffectivenessWeight  * timingEffectiveness +
				@be_spatialEffectivenessWeight * spatialEffectiveness

			# Note: this is tied to schema in SingleDetGroupMetric class
			detGroupMetric = {
				dgId: @detGroupId,
				be: brand_effectiveness,
				dgc: detGroupCrowding,
				vs: visualSaliency,
				te: timingEffectiveness,
				se: spatialEffectiveness,
				dc: detectionsCount,
				qd: quadrantsCount
			}

			return detGroupMetric
		end

		# for det_group_crowding
		def spatial_det_group_crowding(cumulativeAreaHash)
			spatialDetGroupCrowding = 0
			allGroupArea = cumulativeAreaHash.collect{|k,v| v}.sum

			detGroupArea = operate_det_hash(cumulativeAreaHash, :add)

			if allGroupArea > 0
				spatialDetGroupCrowding = detGroupArea/allGroupArea
			end
			return spatialDetGroupCrowding
		end

		def visual_saliency(visualSaliencyHash)
			return operate_det_hash(visualSaliencyHash, :average)
		end

		# for timing_effectiveness
		def max_event_score(eventScoresHash)
			return operate_det_hash(eventScoresHash, :max)
		end

		def spatial_effectiveness(spatialEffectivenessHash)
			return operate_det_hash(spatialEffectivenessHash, :max)
		end

		def detections_count(detectionsCountHash)
			return operate_det_hash(detectionsCountHash, :add)
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
			return qdTotal
		end

		def operate_det_hash(inputHash, opMethod)
			output = 0

			@detectableIds.each do |dId|
				if opMethod == :max
					output = [output, inputHash[dId]].max
				elsif (opMethod == :add) || (opMethod == :average)
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