module States
  class SummaryResolutions

    attr_accessor :timeFactors

    def initialize
      @timeFactors = [
        States::SummaryResolutions.resolutionsGame +
        States::SummaryResolutions.resolutionsSeason].flatten.sort
    end

    def self.finestGameResolution
      return States::SummaryResolutions.resolutionsGame.first
    end

    # Note: each resolution refers to number of seconds
    # Get parts in increasing resolution so that coarser resolution
    # with less data gets ajaxed in first

    def self.resolutionsGame
      return [States::SummaryResolutions.resolutionsGame_part_1 +
            States::SummaryResolutions.resolutionsGame_part_2].flatten.sort
    end

    def self.resolutionsGame_part_1
      return [10]
    end

    def self.resolutionsGame_part_2
      return [1]
    end

    def self.resolutionsSeason
      return [States::SummaryResolutions.resolutionsSeason_part_1 +
            States::SummaryResolutions.resolutionsSeason_part_2 +
            States::SummaryResolutions.resolutionsSeason_part_3].flatten.sort
    end

    def self.resolutionsSeason_part_1
      return [600]
    end

    def self.resolutionsSeason_part_2
      return [300]
    end

    def self.resolutionsSeason_part_3
      return [60]
    end
  end
end
