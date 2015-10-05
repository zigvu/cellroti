module Services
	class VideoDataImportService
		def initialize(client, video)
			@client = client
			@video = video
		end

		def create
			enqueue()
		end

		def destroy
			djName = "NewVideoDataImportJob_#{@video.id}"
			Delayed::Job.all.each do |dj|
				if (dj.name == djName) and (dj.locked_at != nil)
					# if computation has already started, can't delete
					raise "Wait for job to be done prior to deleting det group"
				elsif (dj.name == djName) and (dj.attempts == 0)
					# stop job if it hasn't started running yet
					dj.destroy 
				end
			end

			# remove the video from all queues
			cs = @client.settings
			cs.removeJobsViQueue(@video.id)
			cs.removeJobsViWorking(@video.id)
			cs.removeJobsViFail(@video.id)
			cs.removeJobsViReview(@video.id)
		end

		def release
			# simply remove from review queue
			cs = @client.settings
			cs.removeJobsViReview(@video.id)
		end

		def requeue
			# remove from internal queue and enqueue again
			cs = @client.settings
			cs.removeJobsViFail(@video.id)
			enqueue()
		end

		def enqueue
			videoDataImportJobHash = {
				client_id: @client.id,
				video_id: @video.id
			}
			Delayed::Job.enqueue VideoDataImportJob.new(
				videoDataImportJobHash), :queue => 'videoDataImport', :priority => 20
		end

	end
end