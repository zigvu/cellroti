require 'json'

module Metrics
	class CalculateDetGroupMetrics
		def initialize(video, detGroupIds)
			@video = video
			@det_group_detectables = {}
			detGroupIds.each do |dgId|
				@det_group_detectables[dgId] = DetGroup.find(dgId).detectables.pluck(:id)
			end
			@allDetectableIds = @det_group_detectables.map { |k,v| v }.flatten.uniq

			@slidingWindowSize = 5
			@slidingWindowDecayValues = [0.05, 0.05, 0.1, 0.3, 0.5]
			@temporalDetGroupCrowdingWindows = Metrics::SlidingWindow.get_sliding_window_hash(
				@det_group_detectables.map { |k,v| k }, @slidingWindowSize, @slidingWindowDecayValues)
			@timingEffectivenessWindows = Metrics::SlidingWindow.get_sliding_window_hash(
				@det_group_detectables.map { |k,v| k }, @slidingWindowSize, @slidingWindowDecayValues)

			@spatialDetGroupCrowdingWeight = 0.75
			@temporalDetGroupCrowdingWeight = 0.25

			@be_brandGroupCrowdingWeight = 0.25
			@be_visualSaliencyWeight = 0.25
			@be_timingEffectivenessWeight = 0.25
			@be_spatialEffectivenessWeight = 0.25
		end

		def calculate
			# sanity check
			detectableMetrics = @video.detectable_metrics.first
			raise "Video has no detectable metrics saved" if detectableMetrics == nil
			singleMetrics = detectableMetrics.single_detectable_metrics
			raise "Video has no single detectable metrics saved" if singleMetrics.count == 0
			vDetIds = singleMetrics.pluck(:detectable_id).uniq
			@allDetectableIds.each do |dId|
				raise "Video is not evaluated against some detectables" if not vDetIds.include?(dId)
			end

			# store results in hash to be saved in individual documents
			detGroupMetrics = {}
			@det_group_detectables.each do |dgId, detectablesId|
				detGroupMetrics[dgId] = []
			end
			sortedFrameNums = singleMetrics.pluck(:frame_number).uniq.sort
			sortedFrameNums.each do |frameNum|
				# puts "Working on frame number: #{frameNum}"
				frameTime = singleMetrics.where(frame_number: frameNum).first.frame_time

				# initialize variables for this frame
				temporalDetGroupCrowding = {}    # spatial score of det_group in timeline
				timingEffectiveness = {}         # score of events in timeline
				detGroupCrowding = {}            # combined crowding scores - space and time

				@det_group_detectables.each do |dgId, detectablesId|
					temporalDetGroupCrowding[dgId] = 0
					timingEffectiveness[dgId] = 0
					detGroupCrowding[dgId] = 0
				end

				spatialDetGroupCrowding = spatial_det_group_crowding(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :cumulative_area)])

				visualSaliency = visual_saliency(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :visual_saliency)])

				eventScores = max_event_score(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :event_score)])

				spatialEffectiveness = spatial_effectiveness(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :spatial_effectiveness)])

				detectionsCount = detections_count(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :detections_count)])

				quadrantsCount = quadrants_count(Hash[singleMetrics
					.where(frame_number: frameNum).in(detectable_id: @allDetectableIds)
					.pluck(:detectable_id, :quadrants)])

				# populate sliding window
				@det_group_detectables.each do |dgId, detectablesId|
					@temporalDetGroupCrowdingWindows[dgId].add(spatialDetGroupCrowding[dgId])
					temporalDetGroupCrowding[dgId] = @temporalDetGroupCrowdingWindows[dgId].get_decayed_average
					
					@timingEffectivenessWindows[dgId].add(eventScores[dgId])
					timingEffectiveness[dgId] = @timingEffectivenessWindows[dgId].get_decayed_average

					detGroupCrowding[dgId] = (
						(@spatialDetGroupCrowdingWeight * spatialDetGroupCrowding[dgId]) + 
						(@temporalDetGroupCrowdingWeight * temporalDetGroupCrowding[dgId]))
				end

				# populate database
				@det_group_detectables.each do |dgId, detectablesId|
					brand_effectiveness = 
						@be_brandGroupCrowdingWeight   * detGroupCrowding[dgId] +
						@be_visualSaliencyWeight       * visualSaliency[dgId] +
						@be_timingEffectivenessWeight  * timingEffectiveness[dgId] +
						@be_spatialEffectivenessWeight * spatialEffectiveness[dgId]

					# Note: this is tied to schema in SingleDetGroupMetric class
					detGroupMetrics[dgId] << SingleDetGroupMetric.new({
						frame_number: frameNum,
						frame_time: frameTime,
						brand_effectiveness: brand_effectiveness,
						det_group_crowding: detGroupCrowding[dgId],
						visual_saliency: visualSaliency[dgId],
						timing_effectiveness: timingEffectiveness[dgId],
						spatial_effectiveness: spatialEffectiveness[dgId],
						detections_count: detectionsCount[dgId],
						quadrants: quadrantsCount[dgId]
					})
				end
			end

			return detGroupMetrics
		end

		# for det_group_crowding
		def spatial_det_group_crowding(cumulativeAreaHash)
			spatialDetGroupCrowding = {}
			detGroupArea = operate_det_hash(cumulativeAreaHash, :add)

			allGroupArea = detGroupArea.map{ |k,v| v}.sum
			if allGroupArea <= 0
				@det_group_detectables.each do |dgId, detectablesId|
					spatialDetGroupCrowding[dgId] = 0
				end
			else
				@det_group_detectables.each do |dgId, detectablesId|
					spatialDetGroupCrowding[dgId] = detGroupArea[dgId]/allGroupArea
				end
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
			quadrantsCount = {}
			@det_group_detectables.each do |dgId, detectablesId|
				qdTotal = {}
				detectablesId.each_with_index do |dId, idx|
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
				quadrantsCount[dgId] = qdTotal
				# puts quadrantsCount[dgId]
			end
			return quadrantsCount
		end

		def operate_det_hash(inputHash, opMethod)
			outputHash = {}
			@det_group_detectables.each do |dgId, detectablesId|
				outputHash[dgId] = 0
				detectablesId.each do |dId|
					if opMethod == :max
						outputHash[dgId] = [outputHash[dgId], inputHash[dId]].max
					elsif (opMethod == :add) || (opMethod == :average)
						outputHash[dgId] += inputHash[dId]
					else
						raise "Unknown method to operate on hash"
					end
				end
				if opMethod == :average
					outputHash[dgId] /= detectablesId.count if detectablesId.count > 0
				end
				#puts "#{dgId}: #{detectablesId} : #{outputHash[dgId]}"
			end
			return outputHash
		end

	end
end