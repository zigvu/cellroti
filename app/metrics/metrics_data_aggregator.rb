module Metrics
	class MetricsDataAggregator
		attr_accessor :numOfFrames

		def initialize(configReader, resolution, detectionFrameRate, summaryMetricId)
			@resolution = resolution

			@numOfFrames = (resolution * detectionFrameRate).to_i
			@summaryMetricId = summaryMetricId

			@data = {}
			@frameCounter = 0
		end

		def hasDataToDump?
			return (@frameCounter != 0)
		end

		def isReadyToDumpData?
			return (@frameCounter == @numOfFrames)
		end

		# add singleDetGroupMetric (abbr. sdgm)
		def addData(sdgm)
			# replace current frame reference
			@data[:frame_number] = sdgm.frame_number
			@data[:frame_time] = sdgm.frame_time

			@data[:resolution] = @resolution
			#@data[:sequence_counter] = sequenceCounter <- done when getting data

			# update data values - use max
			@data[:brand_effectiveness] = sdgm.brand_effectiveness if sdgm.brand_effectiveness > @data[:brand_effectiveness]
			@data[:det_group_crowding] = sdgm.det_group_crowding if sdgm.det_group_crowding > @data[:det_group_crowding]
			@data[:visual_saliency] = sdgm.visual_saliency if sdgm.visual_saliency > @data[:visual_saliency]
			@data[:timing_effectiveness] = sdgm.timing_effectiveness if sdgm.timing_effectiveness > @data[:timing_effectiveness]
			@data[:spatial_effectiveness] = sdgm.spatial_effectiveness if sdgm.spatial_effectiveness > @data[:spatial_effectiveness]
			@data[:detections_count] += sdgm.detections_count  #  --> raw count, not max
			@data[:view_duration] += sdgm.view_duration        #  --> raw count, not max

			if @frameCounter == 0
				@data[:quadrants] = {}
				sdgm.quadrants.each do |k,v|
					@data[:quadrants][k] = v
				end
			else
				sdgm.quadrants.each do |k,v|
					@data[:quadrants][k] = v if v > @data[:quadrants][k]
				end
			end


			# keep code around in case needed to do averaging
			# # update data values
			# @data[:brand_effectiveness] += sdgm.brand_effectiveness
			# @data[:det_group_crowding] += sdgm.det_group_crowding
			# @data[:visual_saliency] += sdgm.visual_saliency
			# @data[:timing_effectiveness] += sdgm.timing_effectiveness
			# @data[:spatial_effectiveness] += sdgm.spatial_effectiveness
			# @data[:detections_count] += sdgm.detections_count
			# @data[:view_duration] += sdgm.view_duration

			# if @frameCounter == 0
			# 	@data[:quadrants] = {}
			# 	sdgm.quadrants.each do |k,v|
			# 		@data[:quadrants][k] = v
			# 	end
			# else
			# 	sdgm.quadrants.each do |k,v|
			# 		@data[:quadrants][k] += v
			# 	end
			# end

			@frameCounter += 1
		end

		# average value in data structure
		def aggregateValues
			# since no averaging is required, do nothing

			# keep code around in case needed to do averaging
			# # frame_counter keeps track of how many data points were added
			# @data[:brand_effectiveness] /= @frameCounter
			# @data[:det_group_crowding] /= @frameCounter
			# @data[:visual_saliency] /= @frameCounter
			# @data[:timing_effectiveness] /= @frameCounter
			# @data[:spatial_effectiveness] /= @frameCounter
			# # @data[:detections_count] = @data[:detections_count] --> raw count, not average
			# # @data[:view_duration] = @data[:view_duration] --> raw count, not average
			# @data[:quadrants].each do |k,v|
			# 	@data[:quadrants][k] = v/@frameCounter
			# end
		end

		# get current snapshot of data in data structure
		def getCurrentData(sequenceCounter)
			# Note: this is tied to schema in SingleSummaryMetric class
			return {
				fn: @data[:frame_number],
				ft: @data[:frame_time],

				re: @data[:resolution],
				sc: sequenceCounter,

				be: @data[:brand_effectiveness],
				dgc: @data[:det_group_crowding],
				vs: @data[:visual_saliency],
				te: @data[:timing_effectiveness],
				se: @data[:spatial_effectiveness],
				dc: @data[:detections_count],
				vd: @data[:view_duration],
				qd: @data[:quadrants],

				summary_metric_id: @summaryMetricId
			}
		end

		def reset
			@data = {}
			Metrics::MetricsDataAggregator.dataKeys().each do |k|
				@data[k] = 0
			end
			@frameCounter = 0
		end

		def self.dataKeys
			# Note: this is tied to schema in SingleSummaryMetric class
			return [
				:frame_number,
				:frame_time,

				:resolution,
				:sequence_counter,

				:brand_effectiveness,
				:det_group_crowding,
				:visual_saliency,
				:timing_effectiveness,
				:spatial_effectiveness,
				:detections_count,
				:view_duration,
				:quadrants
			]
		end
	end
end