require 'json'

module Metrics
	class DetGroupEffectivenessMetrics
		def initialize(video, detGroups)
			@video = video
			@det_group_detectables = {}
			detGroups.each do |dg|
				@det_group_detectables[dg.id] = dg.detectables.pluck(:id)
			end
			@allDetectables = @det_group_detectables.map { |k,v| v }.flatten.uniq

			@slidingWindowSize = 5
			@slidingWindowDecayValues = [0.05, 0.05, 0.1, 0.3, 0.5]
			@temporalDetGroupCrowdingWindows = Metrics::SlidingWindow.get_sliding_window_hash(
				@det_group_detectables.map { |k,v| k }, @slidingWindowSize, @slidingWindowDecayValues)
			@timingEffectivenessWindows = Metrics::SlidingWindow.get_sliding_window_hash(
				@det_group_detectables.map { |k,v| k }, @slidingWindowSize, @slidingWindowDecayValues)

			@spatialDetGroupCrowdingWeight = 0.75
			@temporalDetGroupCrowdingWeight = 0.25
		end

		def populate
			@video.video_frames.includes(:raw_detectables).find_each(batch_size: 100) do |video_frame|
				# if video_frame.id == 1940
				# 	puts "VF ID: #{video_frame.id}"

					# initialize variables for this frame
					temporalDetGroupCrowding = {}    # spatial score of det_group in timeline
					timingEffectiveness = {}         # score of events in timeline
					detGroupCrowding = {}            # combined crowding scores - space and time

					@det_group_detectables.each do |dgId, detectablesId|
						temporalDetGroupCrowding[dgId] = 0
						timingEffectiveness[dgId] = 0
						detGroupCrowding[dgId] = 0
					end

					spatialDetGroupCrowding = spatial_det_group_crowding(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
							.pluck(:detectable_id, :cumulative_area)])
					visualSaliency = visual_saliency(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
							.pluck(:detectable_id, :visual_saliency)])
					eventScores = max_event_score(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
							.pluck(:detectable_id, :event_score)])
					spatialEffectiveness = spatial_effectiveness(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
							.pluck(:detectable_id, :spatial_effectiveness)])
					detectionsCount = detections_count(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
							.pluck(:detectable_id, :detections_count)])
					quadrantsCount = quadrants_count(Hash[
						video_frame.raw_detectables
							.where(raw_detectables: {detectable_id: @allDetectables})
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
						video_frame.det_group_video_frames.create(
								det_group_crowding: detGroupCrowding[dgId],
								visual_saliency: visualSaliency[dgId],
								timing_effectiveness: timingEffectiveness[dgId],
								spatial_effectiveness: spatialEffectiveness[dgId],
								detections_count: detectionsCount[dgId],
								quadrants: quadrantsCount[dgId],
								det_group_id: dgId)
					end
					# @det_group_detectables.each do |dgId, detectablesId|
					# 	eff = {
					# 			det_group_crowding: detGroupCrowding[dgId],
					# 			visual_saliency: visualSaliency[dgId],
					# 			timing_effectiveness: timingEffectiveness[dgId],
					# 			spatial_effectiveness: spatialEffectiveness[dgId],
					# 			detections_count: detectionsCount[dgId],
					# 			quadrants: quadrantsCount[dgId],
					# 			det_group_id: dgId}
					# 	puts eff
					# end

				# 	break
				# end

			end
			true
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
						qdTotal = JSON.parse(quadrantsCountHash[dId])
					else
						JSON.parse(quadrantsCountHash[dId]).each do |k, v|
							qdTotal[k] += v
						end
					end
				end
				quadrantsCount[dgId] = qdTotal.to_json
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
						raise RuntimeError("Unknown method to operate on hash")
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