module States
	class MetricsProgressStates

		# type of metrics
		def self.videoIngestion
			return "videoIngestion"
		end
		def self.brandGroup
			return "brandGroup"
		end

		# type of process
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
