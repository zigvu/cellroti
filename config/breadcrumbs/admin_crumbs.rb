crumb :root do
  link "Home", root_path
end

# Organization management
crumb :organizations do
  link "Organizations", organizations_path
end

crumb :organization_edit do |organization|
  link organization.name, organizations_path(organization)
  parent :organizations
end

crumb :organization_new do
  link "New organization"
  parent :organizations
end

# Client management
crumb :clients do
  link "Clients", clients_path
end

crumb :client do |client|
  link client.pretty_name, clients_path(client)
  parent :clients
end

crumb :client_edit do |client|
  link client.pretty_name, clients_path(client)
  parent :clients
end

crumb :client_new do
  link "New client"
  parent :clients
end
