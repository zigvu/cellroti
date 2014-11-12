module Metrics
	class CalculateSummaryMetrics
		def initialize(video, detGroupIds)
			@video = video
			@detGroupIds = detGroupIds
			@resolutions = States::SummaryResolutions.new.getFrameCounters(@video.detection_frame_rate)
		end

		def calculate
			# sanity check
			detGroupMetrics = {}
			@video.det_group_metrics.each do |dgm|
				detGroupMetrics[dgm.det_group_id] = dgm.single_det_group_metrics
			end
			raise "Video has no det group metrics saved" if detGroupMetrics.count == 0
			@detGroupIds.each do |dgId|
				raise "Video is not evaluated against det group #{dgId}" if not detGroupMetrics.keys.include?(dgId)
			end

			# create data structure to hold metrics
			summaryMetrics = {}
			brand_effectiveness = {}
			det_group_crowding = {}
			visual_saliency = {}
			timing_effectiveness = {}
			spatial_effectiveness = {}
			detections_count = {}
			quadrants = {}
			@resolutions.each do |t, res|
				brand_effectiveness[t] = {}
				det_group_crowding[t] = {}
				visual_saliency[t] = {}
				timing_effectiveness[t] = {}
				spatial_effectiveness[t] = {}
				detections_count[t] = {}
				quadrants[t] = {}

				summaryMetrics[t] = {}
				detGroupMetrics.each do |dgId, dgValue|
					summaryMetrics[t][dgId] = []
				end
			end
			frameTime = 0

			firstDetGroupSingleMetrics = detGroupMetrics.first[1]
			sortedFrameNums = firstDetGroupSingleMetrics.pluck(:frame_number).uniq.sort
			# BEGIN - for each frame
			sortedFrameNums.each do |frameNum|
				frameTime = firstDetGroupSingleMetrics.where(frame_number: frameNum).first.frame_time

				# BEGIN - set variables to zero first
				@resolutions.each do |t, res|
					if res[:frame_counter] == 0
						detGroupMetrics.each do |dgId, dgValue|
							brand_effectiveness[t][dgId] = 0
							det_group_crowding[t][dgId] = 0
							visual_saliency[t][dgId] = 0
							timing_effectiveness[t][dgId] = 0
							spatial_effectiveness[t][dgId] = 0
							detections_count[t][dgId] = 0
							quadrants[t][dgId] = 0
						end
					end
				end
				# END - set variables to zero first

				# BEGIN - loop through the det groups
				detGroupMetrics.each do |dgId, dgValue|
					dgvf = dgValue.where(frame_number: frameNum).first

					@resolutions.each do |t, res|
						brand_effectiveness[t][dgId] += dgvf.brand_effectiveness
						det_group_crowding[t][dgId] += dgvf.det_group_crowding
						visual_saliency[t][dgId] += dgvf.visual_saliency
						timing_effectiveness[t][dgId] += dgvf.timing_effectiveness
						spatial_effectiveness[t][dgId] += dgvf.spatial_effectiveness
						detections_count[t][dgId] += dgvf.detections_count

						if res[:frame_counter] == 0
							quadrants[t][dgId] = dgvf.quadrants
						else
							dgvf.quadrants.each do |k,v|
								quadrants[t][dgId][k] += v
							end
						end
					end
				end
				# END - loop through the det groups

				# BEGIN - average results and reset counters
				@resolutions.each do |t, res|
					if res[:frame_counter] == res[:num_of_frames]
						detGroupMetrics.each do |dgId, dgValue|
							brand_effectiveness[t][dgId] /= res[:frame_counter]
							det_group_crowding[t][dgId] /= res[:frame_counter]
							visual_saliency[t][dgId] /= res[:frame_counter]
							timing_effectiveness[t][dgId] /= res[:frame_counter]
							spatial_effectiveness[t][dgId] /= res[:frame_counter]
							#detections_count[t][dgId] = detections_count[t][dgId] --> raw count, not average
							quadrants[t][dgId].each do |k,v|
								quadrants[t][dgId][k] = v/res[:frame_counter]
							end

							# save to the right hash
							# Note: this is tied to schema in SingleSummaryMetric class
							summaryMetrics[t][dgId] << SingleSummaryMetric.new({
								frame_time: frameTime,
								brand_effectiveness: brand_effectiveness[t][dgId],
								det_group_crowding: det_group_crowding[t][dgId],
								visual_saliency: visual_saliency[t][dgId],
								timing_effectiveness: timing_effectiveness[t][dgId],
								spatial_effectiveness: spatial_effectiveness[t][dgId],
								detections_count: detections_count[t][dgId],
								quadrants: quadrants[t][dgId]
							})
						end
						# reset counter
						res[:frame_counter] = 0
					else
						# increment counter
						res[:frame_counter] += 1
					end
				end
				# END - average results and reset counters

			end
			# END - for each frame

			# BEGIN - ensure that the last batch gets saved as well
			@resolutions.each do |t, res|
				if res[:frame_counter] != 0
					detGroupMetrics.each do |dgId, dgValue|
						brand_effectiveness[t][dgId] /= res[:frame_counter]
						det_group_crowding[t][dgId] /= res[:frame_counter]
						visual_saliency[t][dgId] /= res[:frame_counter]
						timing_effectiveness[t][dgId] /= res[:frame_counter]
						spatial_effectiveness[t][dgId] /= res[:frame_counter]
						#detections_count[t][dgId] = detections_count[t][dgId] --> raw count, not average
						quadrants[t][dgId].each do |k,v|
							quadrants[t][dgId][k] = v/res[:frame_counter]
						end

						# save to the right hash
						# Note: this is tied to schema in SingleSummaryMetric class
						summaryMetrics[t][dgId] << SingleSummaryMetric.new({
							frame_time: frameTime,
							brand_effectiveness: brand_effectiveness[t][dgId],
							det_group_crowding: det_group_crowding[t][dgId],
							visual_saliency: visual_saliency[t][dgId],
							timing_effectiveness: timing_effectiveness[t][dgId],
							spatial_effectiveness: spatial_effectiveness[t][dgId],
							detections_count: detections_count[t][dgId],
							quadrants: quadrants[t][dgId]
						})
					end
				end
			end
			# END - ensure that the last batch gets saved as well

			return summaryMetrics
		end
		

	end
end