module Metrics
  class CalculateSingleSummary
    def initialize(streamDetection, detGroupId, beginDate, ssmDumper)
      @streamDetection = streamDetection
      @detGroupId = detGroupId
      @beginDate = beginDate
      @summaryBundlers = []
      @ssmDumper = ssmDumper
    end

    def setup
      States::BundleResolutions.resolutions.each do |resolution|
        @summaryBundlers << Metrics::SummaryBundler.new(
          @streamDetection, @detGroupId, @beginDate, resolution, @ssmDumper
        )
      end
    end

    def addFrameData(sdgm)
      @summaryBundlers.each do |sb|
        sb.add(sdgm)
      end
    end

    def finalize
      @summaryBundlers.each do |sb|
        sb.finalize
      end
    end

  end
end
