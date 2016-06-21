module States
  class MetricsProgressStates

    # type of metrics
    def self.videoIngestion
      return "videoIngestion"
    end
    def self.detGroup
      return "detGroup"
    end

    # type of action
    def self.cancelQueue
      return "cancelQueue"
    end
    def self.cancelWorking
      return "cancelWorking"
    end
    def self.requeueFail
      return "requeueFail"
    end
    def self.passReview
      return "passReview"
    end

  end
end
