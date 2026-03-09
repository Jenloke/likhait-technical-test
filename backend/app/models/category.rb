class Category < ApplicationRecord
  has_many :expenses, dependent: :destroy
  validates :name, presence: true, uniqueness: true
  validates :emoji, presence: true, length: { is: 1 }
end
