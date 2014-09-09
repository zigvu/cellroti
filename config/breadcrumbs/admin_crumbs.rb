crumb :root do
  link "Home", root_path
end

# Organization management
crumb :organizations do
  link "Organizations", admin_organizations_path
end

crumb :organization_edit do |organization|
  link organization.name, admin_organization_path(organization)
  parent :organizations
end

crumb :organization_new do
  link "New organization"
  parent :organizations
end

# Client management
crumb :clients do
  link "Clients", admin_clients_path
end

crumb :client do |client|
  link client.pretty_name, admin_client_path(client)
  parent :clients
end

crumb :client_edit do |client|
  link client.pretty_name, admin_client_path(client)
  parent :clients
end

crumb :client_new do
  link "New client"
  parent :clients
end

# Client management
# crumb :det_group do |client|
#   link client.pretty_name, admin_client_path(client)
# end

# crumb :det_group_new do |det_group, client|
#   link "New Group", admin_client_path(client)
#   parent :clients
# end

# crumb :client_edit do |client|
#   link client.pretty_name, admin_client_path(client)
#   parent :clients
# end

# crumb :client_new do
#   link "New client"
#   parent :clients
# end
