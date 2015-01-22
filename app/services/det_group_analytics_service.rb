module Services
	class DetGroupAnalyticsService
		def initialize(client, detGroup)
			@client = client
			@detGroup = detGroup
			# create metrics for those videos which have all detectable
			# in detGroup already evaluated
			dgDetIds = @detGroup.detectables.pluck(:id).uniq
			@videoIds = []
			VideoDetection.each do |vd|
				@videoIds << vd.video_id if (dgDetIds - vd.detectable_ids.uniq).empty?
			end
		end

		def create
			# if det group already exists for the client, do nothing
			if @client.det_groups.pluck(:id).include?(@detGroup.id)
				return true
			end
			
			# if det group exists for any client other than zigvu, metrics computation has happened
			# so we should be just be able to link them to the existing det group metrics
			# TODO - write this part if individual client can create det_groups without help from zigvu

			# if there are no videos to create metrics, handle in controller
			return false if @videoIds.empty?

			# kick off metrics computation and put in tracking queue
			enqueue()
		end

		def destroy
			djName = "NewDetGroupAnalyticsJob_#{@detGroup.id}"
			Delayed::Job.all.each do |dj|
				if (dj.name == djName) and (dj.locked_at != nil)
					# if computation has already started, can't delete
					raise "Wait for job to be done prior to deleting det group"
				elsif (dj.name == djName) and (dj.attempts == 0)
					# stop job if it hasn't started running yet
					dj.destroy 
				end
			end

			# remove the det group from all queues
			cs = Serializers::ClientSettingsSerializer.new(@client.client_setting)
			cs.removeJobsDgQueue(@detGroup.id)
			cs.removeJobsDgWorking(@detGroup.id)
			cs.removeJobsDgFail(@detGroup.id)
			cs.removeJobsDgReview(@detGroup.id)
		end

		def release
			# simply remove from review queue
			cs = Serializers::ClientSettingsSerializer.new(@client.client_setting)
			cs.removeJobsDgReview(@detGroup.id)
		end

		def requeue
			# remove from internal queue and enqueue again
			cs = Serializers::ClientSettingsSerializer.new(@client.client_setting)
			cs.removeJobsDgFail(@detGroup.id)
			enqueue()
		end

		def enqueue
			newDetGroupAnalyticsHash = {
				client_id: @client.id,
				det_group_id: @detGroup.id,
				video_ids: @videoIds
			}
			Delayed::Job.enqueue NewDetGroupAnalyticsJob.new(
				newDetGroupAnalyticsHash), :queue => 'detGroupAnalytics', :priority => 20
		end

	end
end