class Expense < ApplicationRecord
  belongs_to :category

  # Not persisted: lets the client's local "today" override the server's UTC one.
  attr_accessor :timezone_offset_minutes

  validates :date, comparison: { less_than_or_equal_to: :max_allowed_date }
  validates :amount, numericality: { greater_than: 0 }

  private

  def max_allowed_date
    return Date.current if timezone_offset_minutes.blank?

    (Time.current.utc - timezone_offset_minutes.to_i.minutes).to_date
  end
end
