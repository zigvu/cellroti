module Metrics
  class SummaryBundler

    attr_accessor :curDate, :nextDate

    def initialize(streamDetection, detGroupId, beginDate, resolution, ssmDumper)
      @streamDetection = streamDetection
      @detGroupId = detGroupId

      @resolution = resolution
      @dateBundle = States::BundleResolutions.resolutionToBundle(@resolution)

      @beginDate = beginDate
      @beginDateManipulator = Metrics::DateManipulator.new(@beginDate)
      @curDate = beginDate
      @nextDate = @beginDateManipulator.afterSec(@dateBundle)

      @ssmDumper = ssmDumper
      @highestClips = []
      @maxNumHighestClips = 4

      @summaryMetric = nil
      @ssAggregator = Metrics::SingleSummaryAggregator.new(@resolution)
    end

    def add(sdgm)
      sdgmDate = @beginDateManipulator.afterMs(sdgm.stream_frame_time)

      # create summary metric
      createNewSummaryMetric if @summaryMetric == nil

      # add to averages
      @ssAggregator.addData(sdgm)

      # get ssm if resolution achieved
      if((sdgmDate.to_f - @curDate.to_f) >= @resolution)
        # puts "Ssm summry : #{@resolution} :: #{@curDate}"
        ssm, ssmClips = @ssAggregator.getCurrentData
        @ssmDumper.add(ssm)
        addToHighestClips(ssmClips)
        @ssAggregator.reset
        @curDate = sdgmDate
      end

      # if needed, start new bundle
      if(sdgmDate >= @nextDate)
        @summaryMetric.update(highest_clips: {clips: @highestClips})
        @summaryMetric = nil
        @curDate = @nextDate
        @nextDate = Metrics::DateManipulator.new(@curDate).afterSec(@dateBundle)
      end
    end

    def addToHighestClips(ssmClips)
      @highestClips += ssmClips
      @highestClips.sort_by!{ |h| h[:brand_effectiveness] }.reverse!
      while @highestClips.count > @maxNumHighestClips do
        @highestClips.pop
      end
    end

    def createNewSummaryMetric
      # puts "New bundle : #{@dateBundle} :: #{@nextDate}"
      @summaryMetric = @streamDetection.summary_metrics.create(
        det_group_id: @detGroupId,
        begin_date: curDate,
        date_bundle: @dateBundle,
        stream_id: @streamDetection.stream.id
      )
      @ssAggregator.reset
      @ssAggregator.setSummaryMetricId(@summaryMetric.id)
      @highestClips = []
    end

    def finalize
      ssm, ssmClips = @ssAggregator.getCurrentData
      @ssmDumper.add(ssm)
      addToHighestClips(ssmClips)
      @summaryMetric.update(highest_clips: {clips: @highestClips})
    end

  end
end
