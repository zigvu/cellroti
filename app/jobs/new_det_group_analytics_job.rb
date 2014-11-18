class NewDetGroupAnalyticsJob < Struct.new(:newDetGroupAnalyticsHash)
	def perform
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		videoIds = newDetGroupAnalyticsHash[:video_ids]

		# run each processing in own thread
		numOfProcessors = `cat /proc/cpuinfo | grep processor | wc -l`.to_i
		videoIds.each_slice(numOfProcessors) do |group|
			group.map do |videoId|
				Thread.new do
					process_single_video(videoId, [detGroupId])
				end
			end.each(&:join)
		end

		return true
	end

	def display_name
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		return "NewDetGroupAnalyticsJob_#{detGroupId}"
	end
	
	def max_run_time
		10.hours
	end

	def enqueue
		# change state for admin interface
		client = Client.find(newDetGroupAnalyticsHash[:client_id])
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.addJobsDgQueue(detGroupId)
	end

	def before
		# change state for admin interface
		client = Client.find(newDetGroupAnalyticsHash[:client_id])
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.addJobsDgWorking(detGroupId)
		cs.removeJobsDgQueue(detGroupId)
	end

	def after
	end

	def success
		# change state for admin interface
		client = Client.find(newDetGroupAnalyticsHash[:client_id])
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.removeJobsDgWorking(detGroupId)
		cs.addJobsDgReview(detGroupId)
	end

	def error(job, exception)
		# on error, it will retry, so don't count it out yet
	end

	def failure
		# change state for admin interface
		client = Client.find(newDetGroupAnalyticsHash[:client_id])
		detGroupId = newDetGroupAnalyticsHash[:det_group_id]
		cs = Serializers::ClientSettingsSerializer.new(client.client_setting)
		cs.removeJobsDgWorking(detGroupId)
		cs.addJobsDgFail(detGroupId)
	end

	private
		def process_single_video(videoId, detGroupIds)
			Rails.logger.debug {
				"NewDetGroupAnalyticsJob : process_single_video :: DetGroupId: #{detGroupIds.to_s}; VideoId: #{videoId}"
			}
			video = Video.find(videoId)

			cdps = Services::CaffeDataProcessorService.new()
			cdps.calculate_det_group_metrics(video, detGroupIds)
			cdps.calculate_summary_metrics(video, detGroupIds)
		end

end