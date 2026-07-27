class Expense < ApplicationRecord
  belongs_to :category

  # Not persisted: lets the client's local "today" override the server's UTC one.
  attr_accessor :timezone_offset_minutes

  validates :date, comparison: { less_than_or_equal_to: :max_allowed_date }
  validates :amount, numericality: { greater_than: 0 }

  private

  # Real-world UTC offsets: -12:00 to +14:00 (JS getTimezoneOffset sign-flips this).
  MIN_TIMEZONE_OFFSET_MINUTES = -840
  MAX_TIMEZONE_OFFSET_MINUTES = 720

  def max_allowed_date
    return Date.current if timezone_offset_minutes.blank?

    clamped_offset = timezone_offset_minutes.to_i.clamp(MIN_TIMEZONE_OFFSET_MINUTES, MAX_TIMEZONE_OFFSET_MINUTES)
    (Time.current.utc - clamped_offset.minutes).to_date
  end
end
