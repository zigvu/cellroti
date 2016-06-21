module Metrics
  class CalculateAll

    def initialize(video)
      @video = video
      @configReader = States::ConfigReader.new
    end

    def calculate_all(detGroupIds)
      @detGroupIds = detGroupIds
      # calculate det_group_metrics and summary_metrics
      setup_summary_metrics_calculations
      calculate_summary_metrics
    end

    def setup_summary_metrics_calculations
      # sanity check
      videoDetection = @video.video_detections.first
      raise "Video has no detections saved" if videoDetection == nil

      @frameDetections = videoDetection.frame_detections.order_by(frame_number: :asc)
      raise "Video has no frame detections saved" if @frameDetections.count == 0

      allDetectableIds = videoDetection.detectable_ids.map{|i| i.to_i}
      dgDetectableIds = []
      @detGroupIds.each do |dgId|
        dgDetectableIds += DetGroup.find(dgId).detectables.pluck(:id)
      end
      dgDetectableIds.each do |dId|
        raise "Video is not evaluated against some detectables" if not allDetectableIds.include?(dId)
      end
      return true
    end


    def calculate_summary_metrics
      mcsdg = {}
      mcss = {}
      @detGroupIds.each do |dgId|
        # hold objects for single det group metrics calculation
        mcsdg[dgId] = Metrics::CalculateSingleDetGroup.new(@configReader, @video, dgId)
        # hold objects for single summary metrics calculation
        mcss[dgId] = Metrics::CalculateSingleSummary.new(@configReader, @video, dgId)
        mcss[dgId].setup_data_structures()
      end

      @frameDetections.no_timeout.each do |frameDetection|
        frameNumber = frameDetection.frame_number
        frameTime = frameDetection.frame_time
        singleDetectableMetrics = frameDetection.single_detectable_metrics

        @detGroupIds.each do |dgId|
          singleDetGroupMetric = mcsdg[dgId].calculate(singleDetectableMetrics)
          singleDetGroupMetric.frame_number = frameNumber
          singleDetGroupMetric.frame_time = frameTime

          # note that database write happens inside CalculateSingleSummary class
          mcss[dgId].addFrameData(singleDetGroupMetric)
        end
      end

      @detGroupIds.each do |dgId|
        mcss[dgId].finalize_calculations()
      end

      # create indexes if not there yet
      SummaryMetric.no_timeout.create_indexes
      SingleSummaryMetric.no_timeout.create_indexes

      return true
    end

  end
end
