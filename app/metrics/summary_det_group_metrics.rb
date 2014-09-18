require 'json'

module Metrics
	class SummaryDetGroupMetrics
		def initialize(video, detGroups)
			@video = video
			@detGroups = detGroups
			@resolutions = States::SummaryResolutions.new.getFrameCounters(@video.detection_frame_rate)
		end

		def populate
			det_group_crowding = {}
			visual_saliency = {}
			timing_effectiveness = {}
			spatial_effectiveness = {}
			detections_count = {}
			quadrants = {}
			@resolutions.each do |t, res|
				det_group_crowding[t] = {}
				visual_saliency[t] = {}
				timing_effectiveness[t] = {}
				spatial_effectiveness[t] = {}
				detections_count[t] = {}
				quadrants[t] = {}
			end
			frame_time = 0
			
			@video.video_frames
				.includes(:det_group_video_frames)
				.find_each(batch_size: 100) do |video_frame|

				# set variables to zero first
				@resolutions.each do |t, res|
					if res[:frame_counter] == 0
						@detGroups.each do |dg|
							det_group_crowding[t][dg.id] = 0
							visual_saliency[t][dg.id] = 0
							timing_effectiveness[t][dg.id] = 0
							spatial_effectiveness[t][dg.id] = 0
							detections_count[t][dg.id] = 0
							quadrants[t][dg.id] = 0
						end
					end
				end
				frame_time = video_frame.frame_time


				# loop through the det groups of video frame
				video_frame.det_group_video_frames.each do |dgvf|
					@resolutions.each do |t, res|
						det_group_crowding[t][dgvf.det_group_id] += dgvf.det_group_crowding
						visual_saliency[t][dgvf.det_group_id] += dgvf.visual_saliency
						timing_effectiveness[t][dgvf.det_group_id] += dgvf.timing_effectiveness
						spatial_effectiveness[t][dgvf.det_group_id] += dgvf.spatial_effectiveness
						detections_count[t][dgvf.det_group_id] += dgvf.detections_count

						if res[:frame_counter] == 0
							quadrants[t][dgvf.det_group_id] = JSON.parse(dgvf.quadrants)
						else
							JSON.parse(dgvf.quadrants).each do |k,v|
								quadrants[t][dgvf.det_group_id][k] += v
							end
						end
					end
				end

				# average results and reset counters
				@resolutions.each do |t, res|
					if res[:frame_counter] == res[:num_of_frames]
						@detGroups.each do |dg|
							det_group_crowding[t][dg.id] /= res[:frame_counter]
							visual_saliency[t][dg.id] /= res[:frame_counter]
							timing_effectiveness[t][dg.id] /= res[:frame_counter]
							spatial_effectiveness[t][dg.id] /= res[:frame_counter]
							#detections_count[t][dg.id] = detections_count[t][dg.id] --> raw count, not average
							quadrants[t][dg.id].each do |k,v|
								quadrants[t][dg.id][k] = v/res[:frame_counter]
							end

							# save to right table
							@video.send(res[:tname]).create(
								det_group_crowding: det_group_crowding[t][dg.id],
								visual_saliency: visual_saliency[t][dg.id],
								timing_effectiveness: timing_effectiveness[t][dg.id],
								spatial_effectiveness: spatial_effectiveness[t][dg.id],
								detections_count: detections_count[t][dg.id],
								quadrants: quadrants[t][dg.id].to_json,
								frame_time: frame_time,
								det_group_id: dg.id)
						end
						# reset counter
						res[:frame_counter] = 0
					else
						# increment counter
						res[:frame_counter] += 1
					end
				end

				#puts 	"VFID: #{video_frame.id}"
			end

			# ensure that the last batch gets saved as well
			@resolutions.each do |t, res|
				if res[:frame_counter] != 0
					@detGroups.each do |dg|
						det_group_crowding[t][dg.id] /= res[:frame_counter]
						visual_saliency[t][dg.id] /= res[:frame_counter]
						timing_effectiveness[t][dg.id] /= res[:frame_counter]
						spatial_effectiveness[t][dg.id] /= res[:frame_counter]
						#detections_count[t][dg.id] = detections_count[t][dg.id] --> raw count, not average
						quadrants[t][dg.id].each do |k,v|
							quadrants[t][dg.id][k] = v/res[:frame_counter]
						end

						# save to right table
						@video.send(res[:tname]).create(
							det_group_crowding: det_group_crowding[t][dg.id],
							visual_saliency: visual_saliency[t][dg.id],
							timing_effectiveness: timing_effectiveness[t][dg.id],
							spatial_effectiveness: spatial_effectiveness[t][dg.id],
							detections_count: detections_count[t][dg.id],
							quadrants: quadrants[t][dg.id].to_json,
							frame_time: frame_time,
							det_group_id: dg.id)
					end
				end
			end

			# return true
			true
		end
		

	end
end