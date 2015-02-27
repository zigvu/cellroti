module States
	class SummaryResolutions

		attr_accessor :timeFactors

		def initialize
			@timeFactors = [
				States::SummaryResolutions.resolutionsGame + 
				States::SummaryResolutions.resolutionsSeason].flatten.sort
		end

		def self.gameResolution
			return 1
		end
		def self.subSeasonResolution
			return 10
		end
		def self.seasonResolution
			return 60
		end

		def self.resolutionsGame
			return [1, 10]
		end

		def self.resolutionsSeason
			return [60, 300, 600]
		end

	end
end
