class Expense < ApplicationRecord
  belongs_to :category

  validates :date, comparison: { less_than_or_equal_to: -> { Date.current } }
  validates :amount, numericality: { greater_than: 0 }
end
