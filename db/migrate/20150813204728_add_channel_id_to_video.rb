class AddChannelIdToVideo < ActiveRecord::Migration
  def change
    add_reference :videos, :channel, index: true
  end
end
