module States
  class BundleResolutions
    # all time in seconds
    def self.resolutions
      return [
                                              # resolution -> bundle
        1,                                    # 1 sec  -> 1 min
        10,                                   # 10 sec -> 10 min
        1 * 60,                               # 1 min  -> 1 hr
        6 * 60,                               # 6 min  -> 6 hr
        24 * 60,                              # 24 min -> 1 day
      ]
    end

    def self.bundleResolutionRatio
      return 60
    end
    def self.bundles
      return States::BundleResolutions.resolutions.map{
        |r| r * States::BundleResolutions.bundleResolutionRatio
      }
    end
    def self.bundle(resolution)
      return resolution * States::BundleResolutions.bundleResolutionRatio
    end

  end
end
