include EventsHelper

# clear memcached
Rails.cache.clear


# imports
load 'app/seed_helpers/intake_detectable_list.rb'
load 'app/seed_helpers/dummy_data_populator_service.rb'


# data files
logoListFile = '/sftp/sftpuser/seedData/logo_list.csv'

# Create Detectables/Organizations
zigvuOrganization = Organization.create(name: "Zigvu", industry: "Computer Vision")
idl = SeedHelpers::IntakeDetectableList.new(logoListFile)
idl.saveToDb

# Create clients - zigvu HAS to be the first client
zigvuClient = zigvuOrganization.create_client(name: "Zigvu", pretty_name: "Zigvu", description: "Base Client to associate internal users with")

# Create users
zigvuAdmin = User.create(email: "zigvu_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
zigvuAdmin.add_role(States::Roles.zigvu_admin)
zigvuAdmin.update(client: zigvuClient)

zigvuUser = User.create(email: "zigvu_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
zigvuUser.add_role(States::Roles.zigvu_user)
zigvuUser.update(client: zigvuClient)

cocacolaOrganization = Organization.find(5)
cocacolaClient = cocacolaOrganization.create_client(name: "CocaCola", pretty_name: cocacolaOrganization.name, description: "Signed up on 9/8/2015")

cokeAdmin = User.create(email: "coke_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
cokeAdmin.add_role(States::Roles.client_admin)
cokeAdmin.update(client: cocacolaClient)

cokeUser = User.create(email: "coke_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
cokeUser.add_role(States::Roles.client_user)
cokeUser.update(client: cocacolaClient)

# Assign detectables
[10,11,12].each do |detectable_id|
	cocacolaClient.client_detectables.create(detectable_id: detectable_id)
end


# Create det groups
beveragesDetGrp = Client.zigvu_client.det_groups.create(name: "BeveragesForAllClient", pretty_name: "Beverages")
cocacolaDetGrp = Client.zigvu_client.det_groups.create(name: "CocaColaForAllClient", pretty_name: "CocaCola (All brands)")
bestInClassDetGrp = Client.zigvu_client.det_groups.create(name: "BestInClassForAllClient", pretty_name: "Best In Class")

[10,11,12, 17,18,19,20,21,22,  31,32,33,34,35].each do |detectable_id|
	beveragesDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

[31,32,33,34,35].each do |detectable_id|
	cocacolaDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

[6,11,19,26,34,46].each do |detectable_id|
	bestInClassDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end


# #Create sports related


# # World cup
# soccer = Sport.create(name: "Soccer", description: "Football for the rest of the world")

# soccerHalfTimeStart = soccer.event_types.create(name: "Half Time Start", description: "Start of half time!", weight: 0)
# soccerHalfTimeEnd = soccer.event_types.create(name: "Half Time End", description: "End of half time!", weight: 0)
# soccerGoal = soccer.event_types.create(name: "Goal", description: "Goooooaaaal!", weight: 1)
# soccerPenalty = soccer.event_types.create(name: "Penalty", description: "Penaaalty!", weight: 0.9)
# soccerCorner = soccer.event_types.create(name: "Corner", description: "Corner!", weight: 0.5)
# soccerCard = soccer.event_types.create(name: "Card", description: "Red/Yellow cards!", weight: 0.2)

# worldCup = soccer.leagues.create(name: "World Cup", description: "Worldwide, happens every 4 years")
# soccer.leagues.create(name: "Euro Cup", description: "Eurpean, happens every year")
# soccer.leagues.create(name: "MLS", description: "American, happens every year")

# wc2014 = worldCup.seasons.create(name: "World Cup 2014", description: "2014 World Cup")
# mc = Managers::MClient.new(zigvuClient)
# mc.addAllowedSeasonIds(wc2014.id)
# mc = Managers::MClient.new(cocacolaClient)
# mc.addAllowedSeasonIds(wc2014.id)

# ######  BEGIN - AUTO DUMMY DATA POPULATE ######

# # Auto-populate data
# # numOfGames = 64
# # averageLengthMS = 90 * 60 * 1000 # 90 minutes
# numOfGames = 64
# averageLengthMS = 1 * 60 * 2000 # 2 minutes

# countryList = [
# 	"Algeria", "Argentina", "Australia", "Belgium", "Bosnia-Herzegovina", 
# 	"Brazil", "Cameroon", "Chile", "Colombia", "Costa Rica", "Croatia", 
# 	"Ecuador", "England", "France", "Germany", "Ghana", "Greece", 
# 	"Honduras", "Iran", "Italy", "Ivory Coast", "Japan", "Mexico", 
# 	"Netherlands", "Nigeria", "Portugal", "Russia", "South Korea", 
# 	"Spain", "Switzerland", "Uruguay", "U.S."]

# dummyData = SeedHelpers::DummyDataPopulatorService.new(wc2014, cocacolaClient, cocacolaDetGrp.detectables.pluck(:id))
# dummyData.createTeams(countryList)
# dummyData.createManyGames(numOfGames, averageLengthMS)

# ######  END - AUTO DUMMY DATA POPULATE ######

# baseball = Sport.create(name: "Baseball", description: "Primarily American/ Japanese Sports")
# mlb = baseball.leagues.create(name: "MLB", description: "American major league baseball")
# mlb2014 = mlb.seasons.create(name: "MLB 2014", description: "Season 2014")
