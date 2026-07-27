class Category < ApplicationRecord
  has_many :expenses, dependent: :destroy

  DEFAULT_EMOJI = "📦"

  before_validation :set_default_emoji

  validates :name, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 100 }
  validates :emoji, presence: true, length: { maximum: 10 }

  private

  def set_default_emoji
    self.emoji = DEFAULT_EMOJI if emoji.blank?
  end
end
