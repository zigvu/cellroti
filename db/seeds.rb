include EventsHelper

# clear memcached
Rails.cache.clear


# imports
load 'app/seed_helpers/intake_detectable_list.rb'
load 'app/seed_helpers/dummy_stream_data_generator.rb'

# data files
logoListFile = '/sftp/sftpuser/seedData/logo_list.csv'

# Create Detectables/Organizations
zigvuOrganization = Organization.create(name: "Zigvu", industry: "Computer Vision")
idl = SeedHelpers::IntakeDetectableList.new(logoListFile)
idl.saveToDb

# Create clients - zigvu HAS to be the first client
zigvuClient = zigvuOrganization.create_client(name: "Zigvu", pretty_name: "Zigvu", description: "Base Client to associate internal users with")

# Create users
zigvuAdmin = User.create(email: "zigvu_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh', first_name: 'zigvu', last_name: 'admin')
zigvuAdmin.add_role(States::Roles.zigvu_admin)
zigvuAdmin.update(client: zigvuClient)

zigvuUser = User.create(email: "zigvu_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh', first_name: 'zigvu', last_name: 'user')
zigvuUser.add_role(States::Roles.zigvu_user)
zigvuUser.update(client: zigvuClient)

cocacolaOrganization = Organization.find(5)
cocacolaClient = cocacolaOrganization.create_client(name: "CocaCola", pretty_name: cocacolaOrganization.name, description: "Signed up on 9/8/2015")

cokeAdmin = User.create(email: "coke_admin@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh', first_name: 'Samir', last_name: 'Nattan')
cokeAdmin.add_role(States::Roles.client_admin)
cokeAdmin.update(client: cocacolaClient)

cokeUser = User.create(email: "coke_user@zigvu.com", password: "abcdefgh", password_confirmation: 'abcdefgh', first_name: 'Micheal', last_name: 'Bolton')
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

cocaColaDets = [31,32,33,34,35]
cocaColaDets.each do |detectable_id|
  cocacolaDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

[6,11,19,26,34,46].each do |detectable_id|
  bestInClassDetGrp.det_group_detectables.create(detectable_id: detectable_id)
end

d1 = DateTime.now
d2 = Time.at(d1.to_f + 15 * 60 + 23.245).to_datetime
dd = SeedHelpers::DummyStreamDataGenerator.new(cocaColaDets)
dd.createStreamData(1, d1, d2)
