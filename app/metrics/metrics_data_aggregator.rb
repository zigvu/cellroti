module Metrics
	class MetricsDataAggregator

		def initialize(configReader, resolution, detectionFrameRate, summaryMetricId, extractedFrames)
			@resolution = resolution

			@numOfFrames = (resolution * detectionFrameRate).to_i
			@summaryMetricId = summaryMetricId
			@extractedFrames = extractedFrames

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
			@data[:frame_number] = sdgm.frame_number
			@data[:extracted_frame_number][sdgm.frame_number] = sdgm.highest_prob_score
			@data[:frame_time] = sdgm.frame_time

			@data[:resolution] = @resolution
			#@data[:sequence_counter] = sequenceCounter <- called in `getCurrentData` function

			# update data values - use max
			@data[:brand_effectiveness] = sdgm.brand_effectiveness if sdgm.brand_effectiveness > @data[:brand_effectiveness]

			@data[:det_group_crowding] = sdgm.det_group_crowding if sdgm.det_group_crowding > @data[:det_group_crowding]
			@data[:visual_saliency] = sdgm.visual_saliency if sdgm.visual_saliency > @data[:visual_saliency]
			@data[:timing_effectiveness] = sdgm.timing_effectiveness if sdgm.timing_effectiveness > @data[:timing_effectiveness]
			@data[:spatial_effectiveness] = sdgm.spatial_effectiveness if sdgm.spatial_effectiveness > @data[:spatial_effectiveness]

			@data[:view_duration] += sdgm.view_duration        #  --> raw addition, not max
			@data[:view_persistence] = sdgm.view_persistence if sdgm.view_persistence > @data[:view_persistence]

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
			# @data[:view_duration] += sdgm.view_duration
			# @data[:view_persistence] += sdgm.view_persistence

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
			# # @data[:view_duration] = @data[:view_duration] --> raw count, not average
			# # @data[:view_persistence] = @data[:view_persistence] --> raw count, not average
			# @data[:quadrants].each do |k,v|
			# 	@data[:quadrants][k] = v/@frameCounter
			# end
		end

		# get current snapshot of data in data structure
		def getCurrentData(sequenceCounter)
			# Note: this is tied to schema in SingleSummaryMetric class
			return {
				fn: @data[:frame_number],
				efn: getHighestProbScoreFrameNumber(),
				ft: @data[:frame_time],

				re: @data[:resolution],
				sc: sequenceCounter,

				be: @data[:brand_effectiveness],

				dgc: @data[:det_group_crowding],
				vs: @data[:visual_saliency],
				te: @data[:timing_effectiveness],
				se: @data[:spatial_effectiveness],

				vd: @data[:view_duration],
				vp: @data[:view_persistence],

				qd: @data[:quadrants],

				summary_metric_id: @summaryMetricId
			}
		end

		def getHighestProbScoreFrameNumber
			presentEfn = {}
			# one pass through all extracted frames
			@extractedFrames.each do |efn|
				probScore = @data[:extracted_frame_number][efn]
				# collect all frames that are in both data structures
				# and have at least one detectable in det group present
				if (probScore != nil) and (probScore > 0)
					presentEfn[efn] = probScore
				end
			end
			# if no frames were extracted, then handle in UI
			if presentEfn.length() == 0
				return -1
			end

			# sort and return the highest value
			sortedEfn = presentEfn.sort_by {|k,v| v}.reverse()
			return sortedEfn[0][0]
		end

		def reset
			@data = {}
			Metrics::MetricsDataAggregator.dataKeys().each do |k|
				@data[k] = 0
			end
			# this is a hash of {fn: prob_score}
			@data[:extracted_frame_number] = {}
			@frameCounter = 0
		end

		def self.dataKeys
			# Note: this is tied to schema in SingleSummaryMetric class
			return [
				:frame_number,
				:extracted_frame_number,
				:frame_time,

				:resolution,
				:sequence_counter,

				:brand_effectiveness,

				:det_group_crowding,
				:visual_saliency,
				:timing_effectiveness,
				:spatial_effectiveness,

				:view_duration,
				:view_persistence,

				:quadrants
			]
		end
	end
end