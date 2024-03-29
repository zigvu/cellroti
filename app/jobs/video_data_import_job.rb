class VideoDataImportJob < Struct.new(:videoDataImportJobHash)
	def perform
		clientId = videoDataImportJobHash[:client_id]
		videoId = videoDataImportJobHash[:video_id]

		video = Video.find(videoId)

		# populate data
		mvdi = Metrics::VideoDataImport.new(video)
		mvdi.populate
		detGroupIds = mvdi.find_det_group_ids

		# compute all intermediate/final metrics and save
		cam = Metrics::CalculateAll.new(video)
		cam.calculate_all(detGroupIds)

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
		client.settings.addJobsViQueue(videoId)
	end

	def before
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		client.settings.addJobsViWorking(videoId)
		client.settings.removeJobsViQueue(videoId)
	end

	def after
	end

	def success
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		client.settings.removeJobsViWorking(videoId)
		client.settings.addJobsViReview(videoId)
	end

	def error(job, exception)
		# on error, it will retry, so don't count it out yet
	end

	def failure
		# change state for admin interface
		client = Client.find(videoDataImportJobHash[:client_id])
		videoId = videoDataImportJobHash[:video_id]
		client.settings.removeJobsViWorking(videoId)
		client.settings.addJobsViFail(videoId)
	end

end