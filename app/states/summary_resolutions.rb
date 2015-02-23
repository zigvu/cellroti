module States
	class SummaryResolutions

		attr_accessor :resolutions

		def initialize
			# number of resolutions in seconds
			@resolutions = {}

			@timeFactors = [
				States::SummaryResolutions.gameResolution, 
				States::SummaryResolutions.subSeasonResolution, 
				States::SummaryResolutions.seasonResolution]
			@timeFactors.each_with_index do |t, idx|
				@resolutions[t] = {}
			end
		end

		def getFrameCounters(detectionFrameRate)
			@timeFactors.each_with_index do |t, idx|
				# @resolutions[t][:num_of_frames] = (t * detectionFrameRate).to_i
				@resolutions[t][:num_of_frames] = (t ).to_i
				@resolutions[t][:frame_counter] = 0
			end
			return @resolutions
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

	end
end
