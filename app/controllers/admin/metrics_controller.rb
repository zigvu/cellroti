module Admin
	class MetricsController < ApplicationController
    authorize_actions_for ::Organization
		authority_actions :change => :update

		before_filter :ensure_html_format
		before_action :set_organization, only: [:edit, :update, :destroy]

		# GET /metrics
		def index
			@mps = States::MetricsProgressStates # no new required since accessing static vars
			cs = ::Client.zigvu_client.settings
			@viQueue = ::Video.where(id: cs.getJobsViQueue)
			@viWorking = ::Video.where(id: cs.getJobsViWorking)
			@viFail = ::Video.where(id: cs.getJobsViFail)
			@viReview = ::Video.where(id: cs.getJobsViReview)

			@dgQueue = ::DetGroup.where(id: cs.getJobsDgQueue)
			@dgWorking = ::DetGroup.where(id: cs.getJobsDgWorking)
			@dgFail = ::DetGroup.where(id: cs.getJobsDgFail)
			@dgReview = ::DetGroup.where(id: cs.getJobsDgReview)
		end

		# GET /metrics/change
		def change
			@mps = States::MetricsProgressStates

			# Only allow a trusted parameter "white list" through.
			params.permit(:changeId, :process, :type)
			type = params[:type]
			process = params[:process]
			changeId = params[:changeId].to_i

			if type == @mps.detGroup
				detGroup = ::DetGroup.find(changeId)
				dgas = Services::DetGroupAnalyticsService.new(::Client.zigvu_client, detGroup)
				if process == @mps.cancelQueue
					# destroy associated jobs
					dgas.destroy()
				elsif process == @mps.cancelWorking
					# do nothing for now
				elsif process == @mps.requeueFail
					dgas.requeue()
				elsif process == @mps.passReview
					dgas.release()
				end
			end
						
			if type == @mps.videoIngestion
				video = ::Video.find(changeId)
				vdis = Services::VideoDataImportService.new(::Client.zigvu_client, video)
				if process == @mps.cancelQueue
					# destroy associated jobs
					vdis.destroy()
				elsif process == @mps.cancelWorking
					# do nothing for now
				elsif process == @mps.requeueFail
					vdis.requeue()
				elsif process == @mps.passReview
					vdis.release()
				end
			end

      redirect_to admin_metrics_url, notice: 'Updated.'
		end

		private
	end
end