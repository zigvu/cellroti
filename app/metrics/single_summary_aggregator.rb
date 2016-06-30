module Metrics
  class SingleSummaryAggregator
    attr_accessor :posFrameCounter, :data, :highestClips

    def initialize(resolution)
      @resolution = resolution
      @maxNumHighestClips = 4
    end

    def setSummaryMetricId(summaryMetricId)
      @summaryMetricId = summaryMetricId
    end

    # add singleDetGroupMetric (abbr. sdgm)
    def addData(sdgm)
      @data[:stream_frame_time] = sdgm.stream_frame_time

      # update data values
      @data[:brand_effectiveness] += sdgm.brand_effectiveness
      @data[:det_group_crowding] += sdgm.det_group_crowding
      @data[:visual_saliency] += sdgm.visual_saliency
      @data[:timing_effectiveness] += sdgm.timing_effectiveness
      @data[:spatial_effectiveness] += sdgm.spatial_effectiveness
      @data[:view_duration] += sdgm.view_duration
      @data[:view_persistence] += sdgm.view_persistence

      if @data[:quadrants].keys.count == 0
        sdgm.quadrants.each do |k,v|
          @data[:quadrants][k] = v
        end
      else
        sdgm.quadrants.each do |k,v|
          @data[:quadrants][k] += v
        end
      end

      if sdgm.brand_effectiveness > 0
        @posFrameCounter += 1
        addToHighestClips(sdgm)
      end
    end

    def addToHighestClips(sdgm)
      @highestClips << {
        kheer_clip_id: sdgm.kheer_clip_id,
        brand_effectiveness: sdgm.brand_effectiveness,
        clip_frame_time: sdgm.clip_frame_time
      }
      @highestClips.sort_by!{ |h| h[:brand_effectiveness] }.reverse!
      @highestClips.pop if @highestClips.count > @maxNumHighestClips
    end

    # average value in data structure
    def aggregateValues
      return if @posFrameCounter == 0
      # frame_counter keeps track of how many data points were added
      @data[:brand_effectiveness] /= @posFrameCounter
      @data[:det_group_crowding] /= @posFrameCounter
      @data[:visual_saliency] /= @posFrameCounter
      @data[:timing_effectiveness] /= @posFrameCounter
      @data[:spatial_effectiveness] /= @posFrameCounter
      # @data[:view_duration] = @data[:view_duration] --> raw count, not average
      # @data[:view_persistence] = @data[:view_persistence] --> raw count, not average
      @data[:quadrants].each do |k,v|
        @data[:quadrants][k] = v/@posFrameCounter
      end
    end

    # get current snapshot of data in data structure
    def getCurrentData
      aggregateValues
      # Note: this is tied to schema in SingleSummaryMetric class
      ssm = {
        sft: @data[:stream_frame_time],
        re: @resolution,

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
      return ssm, @highestClips
    end

    def reset
      @data = {}
      Metrics::SingleSummaryAggregator.dataKeys().each do |k|
        @data[k] = 0
      end
      @data[:quadrants] = {}
      @posFrameCounter = 0
      # format:
      # [{kheer_clip_id:, brand_effectiveness:, clip_frame_time:}, ]
      @highestClips = []
    end

    def self.dataKeys
      # Note: this is tied to schema in SingleSummaryMetric class
      return [
        :stream_frame_time,
        :resolution,

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
