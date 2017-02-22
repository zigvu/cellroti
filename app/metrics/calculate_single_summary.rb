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
      @summaryMetricHashArr = []
      @metricsDataAggregator = {}
      @summaryMetrics = {}
      @sequenceCounter = 0

      extractedFrames = @video.video_detections.first.extracted_frames

      @timeFactors = States::SummaryResolutions.new.timeFactors
      @minTimeFactor = @timeFactors.min

      @timeFactors.each do |t|
        @summaryMetrics[t] = SummaryMetric.create(
          video_id: @video.id,
          det_group_id: @detGroupId,
          resolution_seconds: t)

        @metricsDataAggregator[t] = Metrics::MetricsDataAggregator.new(
          @configReader, t, @video.detection_frame_rate, @summaryMetrics[t].id, extractedFrames)
        @metricsDataAggregator[t].reset()
      end
    end

    def addFrameData(singleDetGroupMetric)
      # add value for reach resolution
      @timeFactors.each do |t|
        @metricsDataAggregator[t].addData(singleDetGroupMetric)
      end

      # if ready to dump data, add to array
      @timeFactors.each do |t|
        if @metricsDataAggregator[t].isReadyToDumpData?
          @metricsDataAggregator[t].aggregateValues()
          @summaryMetricHashArr << @metricsDataAggregator[t].getCurrentData(@sequenceCounter)
          @metricsDataAggregator[t].reset()

          # for the smallest value of t, increase sequence counter
          if t == @minTimeFactor
            @sequenceCounter += 1
          end
        end
      end

      # if write batch size reached, then write to db
      if @summaryMetricHashArr.count >= @mongoBatchInsertSize
        write_batch_to_db()
      end

      return true
    end

    # ensure that the last batch gets computed/saved as well
    def finalize_calculations
      @timeFactors.each do |t|
        if @metricsDataAggregator[t].hasDataToDump?
          @metricsDataAggregator[t].aggregateValues()
          @summaryMetricHashArr << @metricsDataAggregator[t].getCurrentData(@sequenceCounter)
        end
      end

      # write the last batch to db
      write_batch_to_db()

      return true
    end

    def write_batch_to_db()
      if @summaryMetricHashArr.count > 0
        SingleSummaryMetric.collection.insert_many(@summaryMetricHashArr)
        @summaryMetricHashArr = []
      end
    end

  end
end
