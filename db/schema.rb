# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151106220308) do

  create_table "channels", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "client_detectables", force: true do |t|
    t.integer  "client_id"
    t.integer  "detectable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "client_detectables", ["client_id"], name: "index_client_detectables_on_client_id", using: :btree
  add_index "client_detectables", ["detectable_id"], name: "index_client_detectables_on_detectable_id", using: :btree

  create_table "client_settings", force: true do |t|
    t.text     "seasons"
    t.integer  "client_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "jobs"
  end

  create_table "clients", force: true do |t|
    t.string   "name"
    t.string   "pretty_name"
    t.text     "description"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "delayed_jobs", force: true do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "delayed_jobs", ["priority", "run_at"], name: "delayed_jobs_priority", using: :btree

  create_table "det_group_clients", force: true do |t|
    t.integer  "det_group_id"
    t.integer  "client_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "det_group_clients", ["client_id"], name: "index_det_group_clients_on_client_id", using: :btree
  add_index "det_group_clients", ["det_group_id"], name: "index_det_group_clients_on_det_group_id", using: :btree

  create_table "det_group_detectables", force: true do |t|
    t.integer  "det_group_id"
    t.integer  "detectable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "det_group_detectables", ["det_group_id"], name: "index_det_group_detectables_on_det_group_id", using: :btree
  add_index "det_group_detectables", ["detectable_id"], name: "index_det_group_detectables_on_detectable_id", using: :btree

  create_table "det_groups", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "pretty_name"
  end

  create_table "detectables", force: true do |t|
    t.string   "name"
    t.string   "pretty_name"
    t.text     "description"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "detectables", ["organization_id"], name: "index_detectables_on_organization_id", using: :btree

  create_table "event_types", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "sport_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "weight"
  end

  add_index "event_types", ["sport_id"], name: "index_event_types_on_sport_id", using: :btree

  create_table "events", force: true do |t|
    t.integer  "event_type_id"
    t.integer  "game_id"
    t.integer  "team_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "event_time"
  end

  add_index "events", ["event_type_id"], name: "index_events_on_event_type_id", using: :btree
  add_index "events", ["game_id"], name: "index_events_on_game_id", using: :btree
  add_index "events", ["team_id"], name: "index_events_on_team_id", using: :btree

  create_table "game_teams", force: true do |t|
    t.integer  "game_id"
    t.integer  "team_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "game_teams", ["game_id"], name: "index_game_teams_on_game_id", using: :btree
  add_index "game_teams", ["team_id"], name: "index_game_teams_on_team_id", using: :btree

  create_table "games", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "start_date"
    t.string   "venue_city"
    t.string   "venue_stadium"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sub_season_id"
  end

  add_index "games", ["sub_season_id"], name: "index_games_on_sub_season_id", using: :btree

  create_table "leagues", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "sport_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "leagues", ["sport_id"], name: "index_leagues_on_sport_id", using: :btree

  create_table "organizations", force: true do |t|
    t.string   "name"
    t.string   "industry"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles", force: true do |t|
    t.string   "name"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
  add_index "roles", ["name"], name: "index_roles_on_name", using: :btree

  create_table "seasons", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "league_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "seasons", ["league_id"], name: "index_seasons_on_league_id", using: :btree

  create_table "sports", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sub_seasons", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "season_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sub_seasons", ["season_id"], name: "index_sub_seasons_on_season_id", using: :btree

  create_table "teams", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "icon_path"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "league_id"
  end

  add_index "teams", ["league_id"], name: "index_teams_on_league_id", using: :btree

  create_table "user_settings", force: true do |t|
    t.text     "seasonAnalysis"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_settings", ["user_id"], name: "index_user_settings_on_user_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "client_id"
    t.string   "authentication_token"
    t.string   "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit"
    t.integer  "invited_by_id"
    t.string   "invited_by_type"
    t.integer  "invitations_count",      default: 0
    t.string   "first_name"
    t.string   "last_name"
    t.integer  "failed_attempts",        default: 0,  null: false
    t.string   "unlock_token"
    t.datetime "locked_at"
  end

  add_index "users", ["authentication_token"], name: "index_users_on_authentication_token", using: :btree
  add_index "users", ["client_id"], name: "index_users_on_client_id", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
  add_index "users", ["invitations_count"], name: "index_users_on_invitations_count", using: :btree
  add_index "users", ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["unlock_token"], name: "index_users_on_unlock_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

  create_table "videos", force: true do |t|
    t.text     "title"
    t.string   "source_type"
    t.string   "quality"
    t.integer  "length"
    t.string   "runstatus"
    t.float    "playback_frame_rate"
    t.integer  "game_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "detection_frame_rate"
    t.integer  "width"
    t.integer  "height"
    t.integer  "channel_id"
    t.integer  "start_frame_number"
    t.integer  "end_frame_number"
  end

  add_index "videos", ["channel_id"], name: "index_videos_on_channel_id", using: :btree
  add_index "videos", ["game_id"], name: "index_videos_on_game_id", using: :btree

end
