require 'json'

module Metrics
  class StreamDetectionImport
    attr_accessor :streamDetection

    # NOTE: This class assumes that we are calculating summary for 24 hour stream

    def initialize(streamDataFolder)
      @streamDataFolder = streamDataFolder

      @configReader = States::ConfigReader.new
      @frameDetectionDumper = Metrics::MongoCollectionDumper.new('FrameDetection')
    end

    def populate
      # These files are produced in kheer by: app/data_exporters/save_data_for_cellroti_export.rb

      streamMetaDataFile = "#{@streamDataFolder}/stream_meta_data.json"
      update_meta_data(streamMetaDataFile)

      @previousKheerCaptureId = nil
      @clipsHash.each do |clipHash|
        kheerClipId = clipHash['kheer_clip_id'].to_i
        eventsFile = "#{@streamDataFolder}/#{kheerClipId}/events.json"
        localizationFile = "#{@streamDataFolder}/#{kheerClipId}/localizations.json"

        @kheerClipId = clipHash['kheer_clip_id'].to_i
        @kheerCaptureId = clipHash['kheer_capture_id'].to_i
        @streamClipTime = clipHash['stream_clip_time'].to_i

        if @previousKheerCaptureId != @kheerCaptureId
          @frameDetectionDumper.finalize if @previousKheerCaptureId
          initializeContainers
          @previousKheerCaptureId = @kheerCaptureId
        end

        update_events(eventsFile)
        update_localizations(localizationFile)
      end
      @frameDetectionDumper.finalize
    end

    def update_meta_data(streamMetaDataFile)
      streamMetaData = JSON.load(File.open(streamMetaDataFile))
      raise "Stream meta data not proper JSON" if streamMetaData.class != Hash
      stmd = streamMetaData['stream_meta_data']

      kheerStreamId = stmd['kheer_stream_id'].to_i
      bd = stmd['begin_date'].to_datetime
      ed = stmd['end_date'].to_datetime
      @clipsHash = stmd['clips']

      beginDate = Metrics::DateManipulator.new(bd).bundleStartDay
      endDate = beginDate.in(1.day)
      if (bd - beginDate).abs > 1 || (ed - endDate).abs > 1
        Rails.logger.warn("Begin or end date not at day boundaries")
      end

      stream = ::Stream.where(kheer_stream_id: kheerStreamId).first
      @streamDetection = stream.stream_detections
        .where(begin_date: beginDate)
        .where(end_date: endDate)
        .first
      if @streamDetection
        FrameDetection.where(stream_detection_id: @streamDetection.id).delete_all
        EventDetection.where(stream_detection_id: @streamDetection.id).delete_all
        SummaryMetric.where(stream_detection_id: @streamDetection.id).each do |sm|
          # the callback below is too slow and causes memory leak in mongoid
          # so delete single summary metric directly
          SingleSummaryMetric.where(summary_metric_id: sm.id).delete_all
          # this will cascade and delete related data as well
          sm.destroy
        end
        @streamDetection.destroy
      end
      @streamDetection = stream.stream_detections.create(
        begin_date: beginDate,
        end_date: endDate,
        playback_frame_rate: stmd['playback_frame_rate'].to_f,
        detection_frame_rate: stmd['detection_frame_rate'].to_f,
        width: stmd['width'].to_i,
        height: stmd['height'].to_i,
        detectable_ids: stmd['detectable_ids'].map{ |d| d.to_i }
      )
    end

    def update_events(eventsFile)
      # { events: [{frame_number: [cellroti_event_type_id:, ]}, ]}
      eventsData = JSON.load(File.open(eventsFile))
      raise "Events data not proper JSON" if eventsData.class != Hash

      eventsData['events'].each do |ev|
        clipFrameTime = ev['clip_frame_time'].to_i
        streamFrameTime = @streamClipTime + clipFrameTime
        @streamDetection.event_detections.create(
          kheer_event_id: ev['kheer_event_id'].to_i,
          kheer_clip_id: ev['kheer_clip_id'].to_i,
          name: ev['name'],
          weight: ev['weight'].to_f,
          stream_frame_time: streamFrameTime,
          clip_frame_time: clipFrameTime
        )
      end
    end

    def initializeContainers
      @mcsd = {}
      @streamDetection.detectable_ids.each do |detectableId|
        @mcsd[detectableId] = Metrics::CalculateSingleDetectable.new(
          @configReader, @streamDetection, detectableId)
      end
    end

    def update_localizations(localizationFile)
      # Note: the \n placement is important since cellroti ingests line by line
      # i.e., cellroti uses line information to extract specific information.
      # Also note that detections are assumed to be ordered by frame_number
      # format:
      # { localizations: [
      # 	{clip_frame_time: {cellroti_det_id: [{bbox: {x, y, width, height}, score: float}, ], }, },
      # ]}
      totalNumOfLines = %x{wc -l < "#{localizationFile}"}.to_i
      File.foreach(localizationFile).with_index do |line, lineNum|
        if lineNum >= 1 and lineNum < (totalNumOfLines - 1)
          clipFrameTime, detections = getLocsHash(line)
          add_detections(clipFrameTime, detections)
        end
      end
    end

    def add_detections(clipFrameTime, detections)
      streamFrameTime = @streamClipTime + clipFrameTime

      # puts "Working on frame: #{streamFrameTime}"

      singleDetectableMetrics = []
      @streamDetection.detectable_ids.each do |detectableId|
        # get detections or empty array if no detections
        dets = detections[detectableId] || []

        # STORE: detectables
        singleDetectableMetric = @mcsd[detectableId].calculate(streamFrameTime, dets)
        singleDetectableMetrics << singleDetectableMetric
      end

      # STORE: frame detection
      # Note: this is tied to schema in FrameDetection class
      @frameDetectionDumper.add({
        kcl: @kheerClipId,
        kca: @kheerCaptureId,
        sft: streamFrameTime,
        cft: clipFrameTime,
        single_detectable_metrics: singleDetectableMetrics,
        stream_detection_id: @streamDetection.id
      })
    end

    def getLocsHash(line)
      va = JSON.parse(line.chomp.chomp(','))
      clipFrameTime = va.keys.first.to_i
      detections = {}
      @streamDetection.detectable_ids.each do |detectableId|
        detections[detectableId] = []
        dets = va.values.first[detectableId.to_s]
        if dets != nil
          dets.each do |det|
            detections[detectableId] << {
              score: det["score"].to_f,
              bbox: {
                x: det["bbox"]["x"].to_i,
                y: det["bbox"]["y"].to_i,
                width: det["bbox"]["width"].to_i,
                height: det["bbox"]["height"].to_i
              }
            }
          end
        end
      end
      return clipFrameTime, detections
    end

    # find all det groups that can be constructed from a set of detectable Ids
    def find_det_group_ids
      detGroupIds = []
      DetGroup.all.each do |dg|
        detGroupIncluded = true
        dg.detectables.pluck(:id).each do |dId|
          detGroupIncluded = false if not @streamDetection.detectable_ids.include?(dId)
        end
        detGroupIds << dg.id if detGroupIncluded
      end
      return detGroupIds
    end

  end
end
