class Filter
  include Mongoid::Document
  include Mongoid::Timestamps

  # For authority
  include Authority::Abilities

  field :uid, as: :user_id, type: Integer
  field :nm, as: :name, type: String

  #----------------------------------------------------
  # creation
  field :ksts, as: :kheer_stream_ids, type: Array
  field :bgids, as: :brand_group_ids, type: Array

  field :mbd, as: :min_begin_date, type: Time
  field :med, as: :max_end_date, type: Time

  #----------------------------------------------------
  # selection
  field :cbd, as: :cal_begin_date, type: Time
  field :ced, as: :cal_end_date, type: Time


  def user
    ::User.find(self.user_id)
  end

  default_scope  ->{ order(updated_at: :asc) }
end
