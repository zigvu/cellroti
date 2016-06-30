require 'json'

module SeedHelpers
  class DummyStreamDataGenerator
    def initialize(detectableIds)
      @detectableIds = detectableIds

      @eventTypeIds = [0,1,2,3,4]
      @eventNames = ["Goal", "Penalty", "Red Card", "Yellow Card", "Corner"]
      @eventWeight = [1.0, 0.8, 0.5, 0.3, 0.1]
      @numOfEvents = 3
      @tempFolder = '/mnt/tmp'
      @frameStep = 5
      @avgFrameRate = 25
      @timeForSingleFrame = 1000.0 / @frameStep
      @avgLengthOfClip = 1 * 60 * 1000 # 1 minute

      @rnd = Random.new(1234567890)
      @structureTypes = [:brokenSine, :random, :sine]
      @structureTypesIdx = 0

      # file storage
      @locsFolder = "/tmp/locs"
      FileUtils.rm_rf(@locsFolder)
      FileUtils.mkdir_p(@locsFolder)
    end

    def createStreamData(kheerStreamId, beginDate, endDate)
      allClipsArr = []
      ::Stream.where(kheer_stream_id: kheerStreamId).first_or_create
      lastKheerClipId = 1
      kheerCaptureId = 1

      streamClipTime = 0
      lengthMs = [
        @avgLengthOfClip + @rnd.rand((0.1 * @avgLengthOfClip).to_i),
        @avgLengthOfClip - @rnd.rand((0.1 * @avgLengthOfClip).to_i)
      ].sample(random: @rnd)
      neededDuration = endDate.to_f - beginDate.to_f
      while neededDuration >= (streamClipTime / 1000.0) do
        clipFrameTime = createClip(kheerCaptureId, lastKheerClipId, lengthMs)
        allClipsArr << {
          kheer_capture_id: kheerCaptureId,
          kheer_clip_id: lastKheerClipId,
          stream_clip_time: streamClipTime,
          clip_length: clipFrameTime
        }
        # iterate
        streamClipTime += clipFrameTime
        lengthMs = [
          @avgLengthOfClip + @rnd.rand((0.1 * @avgLengthOfClip).to_i),
          @avgLengthOfClip - @rnd.rand((0.1 * @avgLengthOfClip).to_i)
        ].sample(random: @rnd)
        lastKheerClipId += 1
      end

      streamMetaDataFile = "#{@locsFolder}/stream_meta_data.json"
      createStreamMetaData(streamMetaDataFile, kheerStreamId, beginDate, endDate, allClipsArr)

      # populate data
      mcdi = Metrics::StreamDetectionImport.new(@locsFolder)
      mcdi.populate
      detGroupIds = mcdi.find_det_group_ids

      # compute all intermediate/final metrics and save
      cam = Metrics::CalculateAll.new(mcdi.streamDetection)
      cam.calculate_all(detGroupIds)
    end

    def createStreamMetaData(outputFile, kheerStreamId, beginDate, endDate, allClipsArr)
      FileUtils::rm_rf(outputFile)

      formattedStream = {
        kheer_stream_id: kheerStreamId,
        playback_frame_rate: @avgFrameRate,
        detection_frame_rate: @frameStep,
        width: 1280,
        height: 720,
        begin_date: beginDate,
        end_date: endDate,
        clips: allClipsArr,
        detectable_ids: @detectableIds
      }
      File.open(outputFile, 'w') do |f|
        streamMetaData = {stream_meta_data: formattedStream}
        f.puts "#{streamMetaData.to_json}"
      end
      outputFile
    end


    def createClip(kheerCaptureId, kheerClipId, lengthMs)
      puts ""
      puts "Clip: #{kheerClipId}"

      clipFolder = "#{@locsFolder}/#{kheerClipId}"
      FileUtils.mkdir_p(clipFolder)

      eventsFile = "#{clipFolder}/events.json"
      localizationFile = "#{clipFolder}/localizations.json"

      createEvents(eventsFile, kheerClipId, lengthMs)

      numOfFrames = ((lengthMs/1000.0) * @avgFrameRate/@frameStep).floor
      createLocalizationData(localizationFile, numOfFrames)
    end

    # modified from kheer:
    # app/data_exporters/save_data_for_cellroti_export.rb
    def createEvents(outputFile, kheerClipId, lengthMs)
      FileUtils::rm_rf(outputFile)

      events = []
      for _ in 0..(@rnd.rand(@numOfEvents))
        eventTypeId = @eventTypeIds.sample(random: @rnd)
        events << {
          kheer_event_id: @rnd.rand(99) + 1,
          kheer_clip_id: kheerClipId,
          name: @eventNames[eventTypeId],
          weight: @eventWeight[eventTypeId],
          clip_frame_time: @rnd.rand(lengthMs)
        }
      end

      # { events: [{frame_number: [cellroti_event_type_id:, ]}, ]}
      File.open(outputFile, 'w') do |f|
        eventsFormatted = {events: events}
        f.puts "#{eventsFormatted.to_json}"
      end
      outputFile
    end


    # modified from kheer:
    # app/data_exporters/save_data_for_cellroti_export.rb
    def createLocalizationData(outputFile, numOfFrames)
      FileUtils::rm_rf(outputFile)

      # Note: Cellroti ingests this line-by-line assuming each line is valid JSON
      # Also note that localizations are assumed to be ordered by clip_frame_time
      # format:
      # { localizations: [
      # 	{clip_frame_time: {cellroti_det_id: [{bbox: {x, y, width, height}, score: float}, ], }, },
      # ]}

      structureType = @structureTypes[@structureTypesIdx % @structureTypes.count]
      sdg = SeedHelpers::StructuredDataGenerator.new(
        structureType, numOfFrames, @frameStep, @rnd)
      sdg.setDetectableIds(@detectableIds)
      clipData = sdg.generate()
      @structureTypesIdx += 1

      firstLine = true
      clipFrameTime = 0
      File.open(outputFile, 'w') do |f|
        f.puts "{\"localizations\": ["
        clipData.each do |frameNumber, formattedLoc|
          formattedLine = {:"#{clipFrameTime.to_i}" => formattedLoc}.to_json
          if firstLine
            formattedLine = "  #{formattedLine}"
            firstLine = false
          else
            formattedLine = ",\n  #{formattedLine}"
          end
          f << formattedLine
          clipFrameTime += @timeForSingleFrame
        end
        f.puts "\n]}"
      end
      clipFrameTime
    end

  end
end
