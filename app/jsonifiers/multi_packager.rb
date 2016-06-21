
module Jsonifiers
  class MultiPackager < Jsonifiers::JAnalytics
    def initialize(gameIds, detGroupIds, summaryResolutions)
      @gameIds = gameIds.sort
      @detGroupIds = detGroupIds.sort
      @summaryResolutions = summaryResolutions
    end

    # NOTE: This function uses a LOT of in-place string concatenation
    # if changing, double check for bugs!
    def getData
      # add data keys
      dataKeys = Jsonifiers::GameDetGroupPackager.brand_group_data_keys
      retJSON = getHashJSON('brand_group_data_keys', dataKeys)
      retJSON.chomp!('}')
      retJSON << ","

      # add game events for a single game case
      if @gameIds.count == 1
        gameEvents = Jsonifiers::GameEventsPackager.new(
          Game.find(@gameIds.first), @summaryResolutions
        ).to_json()
        retJSON << gameEvents.reverse!.chomp!('{').reverse!
      else
        gameEvents = getHashJSON('game_events', nil)
        retJSON << gameEvents.reverse!.chomp!('{').reverse!
      end
      retJSON.chomp!('}')

      brandGroupMap = Jsonifiers::DetGroupPackager.new(@detGroupIds).to_json()
      retJSON << ', "brand_group_map": ' << brandGroupMap << ","

      # concatenate string data for each game
      gameData = '"ndx_data":['
      @gameIds.each do |gameId|
        gd = '{"game_id": ' << "#{gameId}" << ', "game_data": ['
        @detGroupIds.each do |detGroupId|
          dj = Jsonifiers::GameDetGroupPackager.new(
              Game.find(gameId),
              DetGroup.find(detGroupId),
              @summaryResolutions
            ).to_json()
          # dj = [1].to_json
          gd << '{"brand_group_id": ' << "#{detGroupId}" << ', "data": ' << dj << '},'
        end
        gd.chomp!(',')

        gd << "]},"
        gameData << gd
      end
      gameData.chomp!(',')
      gameData << ']'

      retJSON << gameData
      retJSON << '}'
      return retJSON
    end

    def getHashJSON(hashName, hashData)
      if hashData == nil
        return {hashName => {}}.to_json
      else
        return {hashName => hashData}.to_json
      end
    end

  end
end
