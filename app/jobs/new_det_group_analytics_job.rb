class NewDetGroupAnalyticsJob < Struct.new(:newDetGroupAnalyticsHash)
  def perform
    detGroupId = newDetGroupAnalyticsHash[:det_group_id]
    videoIds = newDetGroupAnalyticsHash[:video_ids]

    # run each processing in own process
    # TODO : if numOfProcessors > max_thread_pool, limit
    # numOfProcessors = `cat /proc/cpuinfo | grep processor | wc -l`.to_i
    Parallel.each(videoIds) do |videoId|
      ActiveRecord::Base.connection.reconnect!
      process_single_video(videoId, [detGroupId])
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
    client.settings.addJobsDgQueue(detGroupId)
  end

  def before
    # change state for admin interface
    client = Client.find(newDetGroupAnalyticsHash[:client_id])
    detGroupId = newDetGroupAnalyticsHash[:det_group_id]
    client.settings.addJobsDgWorking(detGroupId)
    client.settings.removeJobsDgQueue(detGroupId)
  end

  def after
  end

  def success
    # change state for admin interface
    client = Client.find(newDetGroupAnalyticsHash[:client_id])
    detGroupId = newDetGroupAnalyticsHash[:det_group_id]
    client.settings.removeJobsDgWorking(detGroupId)
    client.settings.addJobsDgReview(detGroupId)

    # after successfully creating metrics, link this det_group to client
    client.det_group_clients.create(det_group: DetGroup.find(detGroupId))
  end

  def error(job, exception)
    # on error, it will retry, so don't count it out yet
  end

  def failure
    # change state for admin interface
    client = Client.find(newDetGroupAnalyticsHash[:client_id])
    detGroupId = newDetGroupAnalyticsHash[:det_group_id]
    client.settings.removeJobsDgWorking(detGroupId)
    client.settings.addJobsDgFail(detGroupId)
  end

  private
    def process_single_video(videoId, detGroupIds)
      Rails.logger.debug {
        "NewDetGroupAnalyticsJob : process_single_video :: DetGroupId: #{detGroupIds.to_s}; VideoId: #{videoId}"
      }
      video = Video.find(videoId)

      # compute all intermediate/final metrics and save
      cam = Metrics::CalculateAll.new(video)
      cam.calculate_all(detGroupIds)
    end

end
