module Metrics
	class CalculateSingleSummary
		def initialize(configReader, video, detGroupId)
			@configReader = configReader
			@video = video
			@detGroupId = detGroupId

			@mongoBatchInsertSize = @configReader.g_mongoBatchInsertSize
		end

		# create data structure to hold average values
		def setup_data_structures
			@resolutions = States::SummaryResolutions.new.getFrameCounters(@video.detection_frame_rate)

			@brand_effectiveness = {}
			@det_group_crowding = {}
			@visual_saliency = {}
			@timing_effectiveness = {}
			@spatial_effectiveness = {}
			@detections_count = {}
			@quadrants = {}

			@summaryMetricHashArr = {}
			@summaryMetricIds = {}

			@resolutions.each do |t, res|
				@brand_effectiveness[t] = {}
				@det_group_crowding[t] = {}
				@visual_saliency[t] = {}
				@timing_effectiveness[t] = {}
				@spatial_effectiveness[t] = {}
				@detections_count[t] = {}
				@quadrants[t] = {}

				@summaryMetricHashArr[t] = []
				summaryMetric = SummaryMetric.create(
					video_id: @video.id,
					det_group_id: @detGroupId,
					resolution_seconds: t)
				@summaryMetricIds[t] = summaryMetric.id
			end

			# helper before loop:
			@firstRes = @resolutions.keys[0]
			@frameTime = 0
		end

		# set the data structures to given value
		def set_data_structure_to_value(t, setToValue)
			@brand_effectiveness[t] = setToValue
			@det_group_crowding[t] = setToValue
			@visual_saliency[t] = setToValue
			@timing_effectiveness[t] = setToValue
			@spatial_effectiveness[t] = setToValue
			@detections_count[t] = setToValue
			@quadrants[t] = setToValue
		end

		# add value of det group to data structure
		def add_single_det_group_metric_to_data_structure(t, singleDetGroupMetric)
			@brand_effectiveness[t] += singleDetGroupMetric.brand_effectiveness
			@det_group_crowding[t] += singleDetGroupMetric.det_group_crowding
			@visual_saliency[t] += singleDetGroupMetric.visual_saliency
			@timing_effectiveness[t] += singleDetGroupMetric.timing_effectiveness
			@spatial_effectiveness[t] += singleDetGroupMetric.spatial_effectiveness
			@detections_count[t] += singleDetGroupMetric.detections_count

			if @resolutions[t][:frame_counter] == 0
				@quadrants[t] = singleDetGroupMetric.quadrants
			else
				singleDetGroupMetric.quadrants.each do |k,v|
					@quadrants[t][k] += v
				end
			end
		end

		# average value in data structure
		def average_values_in_data_structure(t)
			# frame_counter keeps track of how many data points were added
			@brand_effectiveness[t] /= @resolutions[t][:frame_counter]
			@det_group_crowding[t] /= @resolutions[t][:frame_counter]
			@visual_saliency[t] /= @resolutions[t][:frame_counter]
			@timing_effectiveness[t] /= @resolutions[t][:frame_counter]
			@spatial_effectiveness[t] /= @resolutions[t][:frame_counter]
			#@detections_count[t] = @detections_count[t] --> raw count, not average
			@quadrants[t].each do |k,v|
				@quadrants[t][k] = v/@resolutions[t][:frame_counter]
			end
		end

		# get current snapshot of data in data structure
		def get_current_data_in_data_structure(t, frameTime)
			# Note: this is tied to schema in SingleSummaryMetric class
			return {
				ft: frameTime,
				be: @brand_effectiveness[t],
				dgc: @det_group_crowding[t],
				vs: @visual_saliency[t],
				te: @timing_effectiveness[t],
				se: @spatial_effectiveness[t],
				dc: @detections_count[t],
				qd: @quadrants[t],
				summary_metric_id: @summaryMetricIds[t]
			}
		end

		def addFrameData(singleDetGroupMetric)
			@frameTime = singleDetGroupMetric.frame_time

			# set variables to zero first
			@resolutions.each do |t, res|
				if res[:frame_counter] == 0
					set_data_structure_to_value(t, 0)
				end
			end

			# add value for reach resolution
			@resolutions.each do |t, res|
				add_single_det_group_metric_to_data_structure(t, singleDetGroupMetric)
				# increment counter
				res[:frame_counter] += 1
			end

			# if we have added specified number of frames,
			# start averaging, else, increase frame counters
			@resolutions.each do |t, res|
				if res[:frame_counter] == res[:num_of_frames]
					average_values_in_data_structure(t)
					@summaryMetricHashArr[t] << get_current_data_in_data_structure(t, @frameTime)
					# reset counter
					res[:frame_counter] = 0
				end
			end

			# if write batch size reached, then write to db
			if @summaryMetricHashArr[@firstRes].count >= @mongoBatchInsertSize
				write_batch_to_db()
			end

			return true
		end

		# ensure that the last batch gets computed/saved as well
		def finalize_calculations
			@resolutions.each do |t, res|
				if res[:frame_counter] != 0
					average_values_in_data_structure(t)
					@summaryMetricHashArr[t] << get_current_data_in_data_structure(t, @frameTime)
				end
			end

			# write the last batch to db
			write_batch_to_db()

			return true
		end

		def write_batch_to_db()
			@resolutions.each do |t, res|
				if @summaryMetricHashArr[t].count > 0
					SingleSummaryMetric.collection.insert(@summaryMetricHashArr[t])
					@summaryMetricHashArr[t] = []
				end
			end
		end

	end
end