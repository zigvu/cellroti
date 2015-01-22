class VideoDataImportJob < Struct.new(:videoDataImportJobHash)
	def perform
		clientId = videoDataImportJobHash[:client_id]
		videoId = videoDataImportJobHash[:video_id]
		localizationFile = videoDataImportJobHash[:localization_file]

		# populate data
		mvdi = Metrics::VideoDataImport.new()
		mvdi.populate(Video.find(videoId), localizationFile)

		return true
	end

	def display_name
		videoId = videoDataImportJobHash[:video_id]
		return "NewVideoDataImportJob_#{videoId}"
	end
	
	def max_run_time
		10.hours
	end

	def enqueue
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.addJobsViQueue(videoId)
	end

	def before
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.addJobsViWorking(videoId)
		cs.removeJobsViQueue(videoId)
	end

	def after
	end

	def success
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.removeJobsViWorking(videoId)
		cs.addJobsViReview(videoId)
	end

	def error(job, exception)
		# on error, it will retry, so don't count it out yet
	end

	def failure
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.removeJobsViWorking(videoId)
		cs.addJobsViFail(videoId)
	end

end