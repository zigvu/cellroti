module Metrics
  class DateManipulator
    def initialize(time)
      @time = time
    end

    # where needed, use ActiveSupport `in` and `ago`

    def bundleStartDay
      @time.change(hour: 0)
    end
    def bundleStartHour
      @time.change(min: 0)
    end
    def bundleStartMin
      @time.change(sec: 0)
    end
    def bundleStartSec
      Time.at(@time.to_f.floor)
    end

    def afterMs(ms)
      Time.at(@time.to_f + ms/1000.0)
    end
    def afterSec(sec)
      Time.at(@time.to_f + sec)
    end

  end
end
