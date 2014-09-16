module Metrics
	class DetGroupEffectivenessMetrics
		def initialize(video, client)
			@video = video
			@client = client
			@det_group_detectables = {}
			@client.det_groups.each do |dg|
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
								det_group_id: dgId)
					end

				# 	break
				# end

			end
			true
		end

		# for det_group_crowding
		def spatial_det_group_crowding(cumulativeAreaHash)
			detGroupArea = {}
			spatialDetGroupCrowding = {}
			@det_group_detectables.each do |dgId, detectablesId|
				detGroupArea[dgId] = 0
				detectablesId.each do |dId|
					detGroupArea[dgId] += cumulativeAreaHash[dId]
				end
				#puts "#{dgId}: #{detectablesId} : #{detGroupArea[dgId]}"
			end
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
			visualSaliency = {}
			@det_group_detectables.each do |dgId, detectablesId|
				visualSaliency[dgId] = 0
				detectablesId.each do |dId|
					visualSaliency[dgId] += visualSaliencyHash[dId]
				end
				visualSaliency[dgId] /= detectablesId.count if detectablesId.count > 0
				#puts "#{dgId}: #{detectablesId} : #{visualSaliency[dgId]}"
			end
			return visualSaliency
		end

		# for timing_effectiveness
		def max_event_score(eventScoresHash)
			eventScores = {}
			@det_group_detectables.each do |dgId, detectablesId|
				eventScores[dgId] = 0
				detectablesId.each do |dId|
					eventScores[dgId] = [eventScores[dgId], eventScoresHash[dId]].max
				end
				#puts "#{dgId}: #{detectablesId} : #{eventScores[dgId]}"
			end
			return eventScores
		end

		def spatial_effectiveness(spatialEffectivenessHash)
			spatialEffectiveness = {}
			@det_group_detectables.each do |dgId, detectablesId|
				spatialEffectiveness[dgId] = 0
				detectablesId.each do |dId|
					spatialEffectiveness[dgId] = [spatialEffectiveness[dgId], spatialEffectivenessHash[dId]].max
				end
				#puts "#{dgId}: #{detectablesId} : #{spatialEffectiveness[dgId]}"
			end
			return spatialEffectiveness
		end

	end
end