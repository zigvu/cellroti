module Metrics
  class DateManipulator
    def initialize(dateTime)
      @dateTime = dateTime
    end

    # where needed, use ActiveSupport `in` and `ago`

    def bundleStartDay
      @dateTime.change(hour: 0)
    end
    def bundleStartHour
      @dateTime.change(min: 0)
    end
    def bundleStartMin
      @dateTime.change(sec: 0)
    end
    def bundleStartSec
      Time.at(@dateTime.to_f.floor).to_datetime
    end

    def afterMs(ms)
      Time.at(@dateTime.to_f + ms/1000.0).to_datetime
    end
    def afterSec(sec)
      Time.at(@dateTime.to_f + sec).to_datetime
    end

  end
end
