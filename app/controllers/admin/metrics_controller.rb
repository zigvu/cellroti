module Admin
	class MetricsController < ApplicationController
		authorize_actions_for ::DetGroup  # same access control as DetGroup
		authority_actions :change => :update

		before_filter :ensure_html_format
		before_action :set_organization, only: [:edit, :update, :destroy]

		# GET /metrics
		def index
			@mps = States::MetricsProgressStates # no new required since accessing static vars
			cs = Serializers::ClientSettingsSerializer.new(::Client.zigvu_client.client_setting)
			@viQueue = Video.where(id: cs.getJobsViQueue)
			@viWorking = Video.where(id: cs.getJobsViWorking)
			@viFail = Video.where(id: cs.getJobsViFail)
			@viReview = Video.where(id: cs.getJobsViReview)

			@dgQueue = DetGroup.where(id: cs.getJobsDgQueue)
			@dgWorking = DetGroup.where(id: cs.getJobsDgWorking)
			@dgFail = DetGroup.where(id: cs.getJobsDgFail)
			@dgReview = DetGroup.where(id: cs.getJobsDgReview)
		end

		# GET /metrics/change
		def change
			@mps = States::MetricsProgressStates

			# Only allow a trusted parameter "white list" through.
			params.permit(:changeId, :process, :type)
			type = params[:type]
			process = params[:process]
			changeId = params[:changeId].to_i

			if type == @mps.brandGroup
				if process == @mps.cancelQueue
					Services::DetGroupAnalyticsService.new(::Client.zigvu_client, DetGroup.find(changeId)).destroy()
				elsif process == @mps.cancelWorking
					# do nothing for now
				elsif process == @mps.requeueFail
					Services::DetGroupAnalyticsService.new(::Client.zigvu_client, DetGroup.find(changeId)).requeue()
				elsif process == @mps.passReview
					Services::DetGroupAnalyticsService.new(::Client.zigvu_client, DetGroup.find(changeId)).release()
				end
			end
						
			if type == @mps.videoIngestion
				if process == @mps.cancelQueue
				elsif process == @mps.cancelWorking
				elsif process == @mps.requeueFail
				elsif process == @mps.passReview
				end
			end

      redirect_to admin_metrics_url, notice: 'Updated.'
		end

		private
	end
end