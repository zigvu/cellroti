include EventsHelper

# clear memcached
Rails.cache.clear


# imports
load 'app/seed_helpers/intake_detectable_list.rb'
load 'app/seed_helpers/dummy_data_populator_service.rb'


# data files
logoListFile = '/sftp/sftpuser/seedData/logo_list.csv'
caffeDataFile = '/sftp/sftpuser/seedData/database_seed_localization.json'


# Create Detectables/Organizations
idl = SeedHelpers::IntakeDetectableList.new(logoListFile)
idl.saveToDb


# Create clients - zigvu HAS to be the first client
zigvuClient = Organization.where(name: "Zigvu").first.create_client(name: "Zigvu", pretty_name: "Zigvu", description: "Base Client to associate internal users with")
cocacolaClient = Organization.where(name: "CocaCola").first.create_client(name: "CocaCola", pretty_name: "CocaCola", description: "Signed up on 9/8/2014")


# Create users
zigvuAdmin = User.create(email: "zigvu_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
zigvuAdmin.add_role(States::Roles.zigvu_admin)
zigvuAdmin.update(client: zigvuClient)

zigvuUser = User.create(email: "zigvu_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
zigvuUser.add_role(States::Roles.zigvu_user)
zigvuUser.update(client: zigvuClient)

cokeAdmin = User.create(email: "coke_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
cokeAdmin.add_role(States::Roles.client_admin)
cokeAdmin.update(client: cocacolaClient)

cokeUser = User.create(email: "coke_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
cokeUser.add_role(States::Roles.client_user)
cokeUser.update(client: cocacolaClient)


# Assign detectables
[1,2,3,5,6].each do |detectable_id|
	cocacolaClient.client_detectables.create(detectable_id: detectable_id)
end


# Create det groups
carbondatedDrinksDetGrp = Client.zigvu_client.det_groups.create(name: "CarbonatedDrinksForAllClient", pretty_name: "Carbonated Drinks")
foodComboDetGrp = Client.zigvu_client.det_groups.create(name: "FoodComboForAllClient", pretty_name: "Food Combo")
bestInClassDetGrp = Client.zigvu_client.det_groups.create(name: "BestInClassForAllClient", pretty_name: "Best In Class")

[1,2,3,4].each do |detectable_id|
	carbondatedDrinksDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

[5,6].each do |detectable_id|
	foodComboDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

[1,3,5].each do |detectable_id|
	bestInClassDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end


#Create sports related


# World cup
soccer = Sport.create(name: "Soccer", description: "Football for the rest of the world")

soccerHalfTimeStart = soccer.event_types.create(name: "Half Time Start", description: "Start of half time!", weight: 0)
soccerHalfTimeEnd = soccer.event_types.create(name: "Half Time End", description: "End of half time!", weight: 0)
soccerGoal = soccer.event_types.create(name: "Goal", description: "Goooooaaaal!", weight: 1)
soccerPenalty = soccer.event_types.create(name: "Penalty", description: "Penaaalty!", weight: 0.9)
soccerCorner = soccer.event_types.create(name: "Corner", description: "Corner!", weight: 0.5)
soccerCard = soccer.event_types.create(name: "Card", description: "Red/Yellow cards!", weight: 0.2)

worldCup = soccer.leagues.create(name: "World Cup", description: "Worldwide, happens every 4 years")
soccer.leagues.create(name: "Euro Cup", description: "Eurpean, happens every year")
soccer.leagues.create(name: "MLS", description: "American, happens every year")

wc2014 = worldCup.seasons.create(name: "World Cup 2014", description: "2014 World Cup")
mc = Managers::MClient.new(zigvuClient)
mc.addAllowedSeasonIds(wc2014.id)
mc = Managers::MClient.new(cocacolaClient)
mc.addAllowedSeasonIds(wc2014.id)

######  BEGIN - AUTO DUMMY DATA POPULATE ######

# Auto-populate data
# numOfGames = 64
# averageLengthMS = 90 * 60 * 1000 # 90 minutes
numOfGames = 2
averageLengthMS = 1 * 60 * 1000 # 1 minutes

countryList = [
	"Algeria", "Argentina", "Australia", "Belgium", "Bosnia-Herzegovina", 
	"Brazil", "Cameroon", "Chile", "Colombia", "Costa Rica", "Croatia", 
	"Ecuador", "England", "France", "Germany", "Ghana", "Greece", 
	"Honduras", "Iran", "Italy", "Ivory Coast", "Japan", "Mexico", 
	"Netherlands", "Nigeria", "Portugal", "Russia", "South Korea", 
	"Spain", "Switzerland", "Uruguay", "U.S."]

dummyData = SeedHelpers::DummyDataPopulatorService.new(caffeDataFile, wc2014, cocacolaClient)
dummyData.createTeams(countryList)
dummyData.createManyGames(numOfGames, averageLengthMS)

# add a last game to expt with mongo data
lastGame = wc2014.games.create(name: "Italy Vs. Iran", description: "13min video", start_date: "2015-01-01 00:00:00", end_date: "2015-01-01 13:54:00", venue_city: "Somewhere Cool", venue_stadium: "Cooler")
lastGameVideo = lastGame.videos.create(title: "Italy vs. Iran", description: "13min video", comment: "13 min vid", source_type: "youtube", source_url: "none", runstatus: "run-complete", start_time: lastGame.start_date, end_time: lastGame.end_date)
# localizationFile = '/sftp/sftpuser/uploads/3/localizations.json'
# mvdi = Metrics::VideoDataImport.new()
# mvdi.populate(lastGameVideo, localizationFile)

######  END - AUTO DUMMY DATA POPULATE ######

baseball = Sport.create(name: "Baseball", description: "Primarily American/ Japanese Sports")
mlb = baseball.leagues.create(name: "MLB", description: "American major league baseball")
mlb2014 = mlb.seasons.create(name: "MLB 2014", description: "Season 2014")
