include EventsHelper


# Create Detectables/Organizations
zigvuOrg = Organization.create(name: "Zigvu", industry: "CV")

cocacolaOrg = Organization.create(name: "CocaCola", industry: "Beverages")
cocacolaOrg.detectables.create(name: "coke", pretty_name: "CocaCola", description: "Main brand")
cocacolaOrg.detectables.create(name: "gatorade", pretty_name: "Gatorade", description: "Sub-brand")
#cocacolaOrg.detectables.create(name: "sprite", pretty_name: "Sprite", description: "Sub-brand")

pepsicolaOrg = Organization.create(name: "Pepsi", industry: "Beverages, Fast Food")
pepsicolaOrg.detectables.create(name: "pepsi", pretty_name: "Pepsi", description: "Main brand")
pepsicolaOrg.detectables.create(name: "powerade", pretty_name: "Powerade", description: "Sub-brand")
#pepsicolaOrg.detectables.create(name: "fanta", pretty_name: "Fanta", description: "Sub-brand")
#pepsicolaOrg.detectables.create(name: "tacobell", pretty_name: "Taco Bell", description: "Sub-brand")

mcDonaldsOrg = Organization.create(name: "McDonalds", industry: "Fast Food")
mcDonaldsOrg.detectables.create(name: "mcdonaldsM", pretty_name: "McDonalds", description: "Main brand")
mcDonaldsOrg.detectables.create(name: "iamlovinit", pretty_name: "I Am Lovin' It", description: "Sub-brand")


# Create clients
zigvuClient = zigvuOrg.create_client(name: "Zigvu", pretty_name: "Zigvu", description: "Base Client to associate internal users with")
cocacolaClient = cocacolaOrg.create_client(name: "CocaCola", pretty_name: "CocaCola", description: "Signed up on 9/8/2014")
pepsiColaClient = pepsicolaOrg.create_client(name: "Pepsi", pretty_name: "Pepsi", description: "Signed up on 9/8/2014")


# Assign detectables
[1,2,3,5,6].each do |detectable_id|
	cocacolaClient.client_detectables.create(detectable_id: detectable_id)
end
[1,3,4,5,6].each do |detectable_id|
	pepsiColaClient.client_detectables.create(detectable_id: detectable_id)
end

# Create det groups
cocacolaClientDetGrp1 = cocacolaClient.det_groups.create(name: "Carbonated Drinks")
[1,2,3].each do |detectable_id|
	cocacolaClientDetGrp1.det_group_detectables.create(detectable_id: detectable_id)
end
cocacolaClientDetGrp2 = cocacolaClient.det_groups.create(name: "Food Combo")
[1,5].each do |detectable_id|
	cocacolaClientDetGrp2.det_group_detectables.create(detectable_id: detectable_id)
end
cocacolaClientDetGrp3 = cocacolaClient.det_groups.create(name: "Best In Class")
[5,6].each do |detectable_id|
	cocacolaClientDetGrp3.det_group_detectables.create(detectable_id: detectable_id)
end

pepsiColaClientDetGrp1 = pepsiColaClient.det_groups.create(name: "Carbonated Drinks")
[1,3,4].each do |detectable_id|
	pepsiColaClientDetGrp1.det_group_detectables.create(detectable_id: detectable_id)
end
pepsiColaClientDetGrp2 = pepsiColaClient.det_groups.create(name: "Food Combo")
[3,5].each do |detectable_id|
	pepsiColaClientDetGrp2.det_group_detectables.create(detectable_id: detectable_id)
end
pepsiColaClientDetGrp3 = pepsiColaClient.det_groups.create(name: "Best In Class")
[5,6].each do |detectable_id|
	pepsiColaClientDetGrp3.det_group_detectables.create(detectable_id: detectable_id)
end


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

pepsiAdmin = User.create(email: "pepsi_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
pepsiAdmin.add_role(States::Roles.client_admin)
pepsiAdmin.update(client: pepsiColaClient)

pepsiUser = User.create(email: "pepsi_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh')
pepsiUser.add_role(States::Roles.client_user)
pepsiUser.update(client: pepsiColaClient)


#Create sports related
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

wcGermany = worldCup.teams.create(name: "Germany", description: "German team")
wcFrance = worldCup.teams.create(name: "France", description: "French team")
wcBrazil = worldCup.teams.create(name: "Brazil", description: "Brazil team")

wc2014 = worldCup.seasons.create(name: "World Cup 2014", description: "2014 World Cup")
wcGermanyVsBrazil = wc2014.games.create(name: "Semi Final", description: "Germany Vs. Brazil", start_date: Time.now - 2.hours, end_date: Time.now - 2.hours + 13.minutes + 53.seconds, venue_city: "Rio", venue_stadium: "Rio Grande")
wcGermanyVsFrance = wc2014.games.create(name: "Semi Final", description: "Germany Vs. France", start_date: Time.now - 1.day - 2.hours, end_date: Time.now - 1.day, venue_city: "Rio", venue_stadium: "Rio Grande")

GameTeam.create(game_id: wcGermanyVsBrazil.id, team_id: wcGermany.id)
GameTeam.create(game_id: wcGermanyVsBrazil.id, team_id: wcBrazil.id)
GameTeam.create(game_id: wcGermanyVsFrance.id, team_id: wcGermany.id)
GameTeam.create(game_id: wcGermanyVsFrance.id, team_id: wcFrance.id)

# Put in some data
wcGermanyVsBrazilVideo = wcGermanyVsBrazil.videos.create(
	title: "Germany Vs. Brazil - First 15 minutes", 
	description: "Game details",
	comment: "Only 15 minutes data",
	source_type: "youtube",
	source_url: "http://none-for-now",
	quality: "720p",
	format: "mkv",
	length: times_to_milliseconds(0,13,52,54),
	runstatus: "run-complete",
	start_time: wcGermanyVsBrazil.start_date,
	end_time: wcGermanyVsBrazil.end_date,
	avg_frame_rate: 25)

wcGermanyVsBrazil.events.create(event_type_id: soccerHalfTimeStart.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,2,0,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerHalfTimeEnd.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,5,0,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerGoal.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,7,10,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerGoal.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,7,50,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerGoal.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,11,30,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerCorner.id, team_id: wcBrazil.id, event_time: times_to_milliseconds(0,12,0,0))
wcGermanyVsBrazil.events.create(event_type_id: soccerPenalty.id, team_id: wcBrazil.id, event_time: times_to_milliseconds(0,12,50,20))

puts "Populating with short 10-class video"
videoFrameFileName = '/home/evan/Vision/temp/sendto_cellroti/database_seed_localization.json'
caffeWriteService = Services::CaffeDataWriterService.new(wcGermanyVsBrazilVideo, videoFrameFileName)
caffeWriteService.populate
puts "Creating raw detectables"
pbm = Metrics::RawDetectableMetrics.new(wcGermanyVsBrazilVideo)
pbm.populate


wcGermanyVsFrance.events.create(event_type_id: soccerHalfTimeStart.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,45,0,0))
wcGermanyVsFrance.events.create(event_type_id: soccerHalfTimeEnd.id, team_id: wcGermany.id, event_time: times_to_milliseconds(0,55,0,0))
wcGermanyVsFrance.events.create(event_type_id: soccerGoal.id, team_id: wcFrance.id, event_time: times_to_milliseconds(0,75,0,0))

baseball = Sport.create(name: "Baseball", description: "Primarily American/ Japanese Sports")
mlb = baseball.leagues.create(name: "MLB", description: "American major league baseball")
mlb2014 = mlb.seasons.create(name: "MLB 2014", description: "Season 2014")


