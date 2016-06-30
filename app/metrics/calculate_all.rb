module Metrics
  class CalculateAll

    def initialize(streamDetection)
      @streamDetection = streamDetection
      @beginDate = @streamDetection.begin_date

      @ssmDumper = Metrics::MongoCollectionDumper.new('SingleSummaryMetric')
      @configReader = States::ConfigReader.new
    end

    def calculate_all(detGroupIds)
      @detGroupIds = detGroupIds
      # calculate det_group_metrics and summary_metrics
      setup_summary_metrics_calculations
      calculate_summary_metrics
    end

    def setup_summary_metrics_calculations
      dgDetectableIds = []
      @detGroupIds.each do |dgId|
        dgDetectableIds += DetGroup.find(dgId).detectables.pluck(:id)
      end

      allDetectableIds = @streamDetection.detectable_ids.map{|i| i.to_i}
      dgDetectableIds.each do |dId|
        if not allDetectableIds.include?(dId)
          raise "StreamDetection is not evaluated against detectable id #{dId}"
        end
      end

      return true
    end


    def calculate_summary_metrics
      mcsdg = {}
      mcss = {}
      @detGroupIds.each do |dgId|
        # hold objects for single det group metrics calculation
        mcsdg[dgId] = Metrics::CalculateSingleDetGroup.new(
          @configReader, @streamDetection.detection_frame_rate, dgId
        )
        # hold objects for single summary metrics calculation
        mcss[dgId] = Metrics::CalculateSingleSummary.new(
          @streamDetection, dgId, @beginDate, @ssmDumper
        )
        mcss[dgId].setup()
      end

      @streamDetection.frame_detections.no_timeout.each do |frameDetection|
        singleDetectableMetrics = frameDetection.single_detectable_metrics

        @detGroupIds.each do |dgId|
          singleDetGroupMetric = mcsdg[dgId].calculate(singleDetectableMetrics)
          singleDetGroupMetric.kheer_clip_id = frameDetection.kheer_clip_id
          singleDetGroupMetric.stream_frame_time = frameDetection.stream_frame_time
          singleDetGroupMetric.clip_frame_time = frameDetection.clip_frame_time

          mcss[dgId].addFrameData(singleDetGroupMetric)
        end

      end

      @detGroupIds.each do |dgId|
        mcss[dgId].finalize
      end

      @ssmDumper.finalize
      # create indexes if not there yet
      SummaryMetric.no_timeout.create_indexes

      return true
    end

  end
end
