class ShortClip
  include Mongoid::Document
  include Mongoid::Timestamps

  before_create :auto_destroy_old_short_clips
  before_destroy :auto_destroy_this_clip

  field :vi, as: :video_id, type: Integer
  field :fn, as: :frame_number, type: Integer
  field :ft, as: :frame_time, type: Integer
  field :cr, as: :is_created, type: Boolean, default: false
  field :mc, as: :is_multi_clip, type: Boolean, default: false

  def auto_destroy_old_short_clips
    configReader = States::ConfigReader.new
    if ShortClip.count > configReader.g_maxShortClips
      ShortClip.limit(configReader.g_numShortClipsToDestroy).order_by(updated_at: :desc).destroy
    end
  end

  def auto_destroy_this_clip
    Managers::MShortClip.new(self).delete_file
  end
end
