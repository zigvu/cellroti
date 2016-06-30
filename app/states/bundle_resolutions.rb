module States
  class BundleResolutions
    # all time in seconds
    def self.resolutions
      return [
                                              # resolution -> bundle  -> range for 300 pts
        1,                                    # 1 sec      -> 1 min   -> 0 - 5 min
        10,                                   # 10 sec     -> 10 min  -> 5 min - 50 min
        1 * 60,                               # 1 min      -> 1 hr    -> 50 min - 5 hrs
        6 * 60,                               # 6 min      -> 6 hr    -> 5 hrs - 30 hrs
        24 * 60,                              # 24 min     -> 1 day   -> 30 hrs above
      ]
    end

    def self.bundleNumOfPoints
      return 300
    end
    def self.bundleResolutionRatio
      return 60
    end
    def self.bundles
      return States::BundleResolutions.resolutions.map{
        |r| r * States::BundleResolutions.bundleResolutionRatio
      }
    end
    def self.resolutionToBundle(resolution)
      return resolution * States::BundleResolutions.bundleResolutionRatio
    end

    def self.getBundle(beginDate, endDate)
      numSeconds = (endDate.to_f - beginDate.to_f).abs
      bndl = nil
      States::BundleResolutions.resolutions.each do |res|
        bndl = States::BundleResolutions.resolutionToBundle(res)
        break if res * States::BundleResolutions.bundleNumOfPoints >= numSeconds
      end
      bndl
    end

    def self.getBundleDates(beginDate, endDate)
      bndl = States::BundleResolutions.getBundle(beginDate, endDate)

      dates = []
      curDate = beginDate.change(hour: 0)
      lastDate = Time.at(lastDate.to_f - bndl).to_datetime
      while curDate < endDate do
        dates << lastDate if curDate >= beginDate
        lastDate = curDate
        curDate = Time.at(lastDate.to_f + bndl).to_datetime
      end
      dates << lastDate
      dates.uniq
    end

  end
end
