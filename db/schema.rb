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

ActiveRecord::Schema.define(version: 20140910172738) do

  create_table "client_detectables", force: true do |t|
    t.integer  "client_id"
    t.integer  "detectable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "client_detectables", ["client_id"], name: "index_client_detectables_on_client_id", using: :btree
  add_index "client_detectables", ["detectable_id"], name: "index_client_detectables_on_detectable_id", using: :btree

  create_table "client_settings", force: true do |t|
    t.text     "brands"
    t.integer  "client_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "clients", force: true do |t|
    t.string   "name"
    t.string   "pretty_name"
    t.text     "description"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

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
    t.integer  "client_id"
  end

  add_index "det_groups", ["client_id"], name: "index_det_groups_on_client_id", using: :btree

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
    t.datetime "end_date"
    t.string   "venue_city"
    t.string   "venue_stadium"
    t.integer  "season_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "games", ["season_id"], name: "index_games_on_season_id", using: :btree

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

  create_table "teams", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "icon_path"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "league_id"
  end

  add_index "teams", ["league_id"], name: "index_teams_on_league_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
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
  end

  add_index "users", ["client_id"], name: "index_users_on_client_id", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

  create_table "video_frames", force: true do |t|
    t.datetime "frame_time"
    t.integer  "frame_number"
    t.integer  "video_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "video_frames", ["video_id"], name: "index_video_frames_on_video_id", using: :btree

  create_table "videos", force: true do |t|
    t.text     "title"
    t.text     "description"
    t.text     "comment"
    t.string   "source_type"
    t.string   "source_url"
    t.string   "quality"
    t.string   "format"
    t.integer  "length"
    t.string   "runstatus"
    t.datetime "start_time"
    t.datetime "end_time"
    t.float    "avg_frame_rate"
    t.integer  "game_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "videos", ["game_id"], name: "index_videos_on_game_id", using: :btree

end
