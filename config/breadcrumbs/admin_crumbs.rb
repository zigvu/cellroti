crumb :admin_root do
  link "Admin Home", root_path
end

# Organization management
crumb :organizations do
  link "Organizations", admin_organizations_path
  parent :admin_root
end

crumb :organization_edit do |organization|
  link organization.name, admin_organization_path(organization)
  parent :organizations
end

crumb :organization_new do
  link "New organization"
  parent :organizations
end


# Brand Groups
crumb :det_groups do
  link "Brand Groups", admin_det_groups_path
  parent :admin_root
end

crumb :det_group_edit do |det_group|
  link det_group.name, admin_det_group_path(det_group)
  parent :det_groups
end

crumb :det_group_new do
  link "New Brand Group"
  parent :det_groups
end


# Client management
crumb :clients do
  link "Clients", admin_clients_path
  parent :admin_root
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

crumb :client_users do |client|
  link client.pretty_name, admin_client_path(client)
  parent :clients
end

crumb :client_users_edit do |client, user|
  link user.name
  parent :client_users, client
end

crumb :client_users_new do |client, user|
  link "Invite New User"
  parent :client_users, client
end


# Metrics
crumb :metrics do
  link "Metrics", admin_metrics_path
  parent :admin_root
end
