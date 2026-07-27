require 'rails_helper'

RSpec.describe Expense, type: :model do
  let(:category) { Category.create!(name: "Food") }

  describe "date validation" do
    it "is valid with today's date" do
      expense = Expense.new(description: "Lunch", amount: 10.00, category: category, date: Date.current)

      expect(expense).to be_valid
    end

    it "is valid with a past date" do
      expense = Expense.new(description: "Lunch", amount: 10.00, category: category, date: Date.current - 1)

      expect(expense).to be_valid
    end

    it "is invalid with a future date" do
      expense = Expense.new(description: "Lunch", amount: 10.00, category: category, date: Date.current + 1)

      expect(expense).not_to be_valid
      expect(expense.errors[:date]).to include("must be less than or equal to #{Date.current}")
    end
  end

  describe "amount validation" do
    it "is valid with a positive amount" do
      expense = Expense.new(description: "Lunch", amount: 10.00, category: category, date: Date.current)

      expect(expense).to be_valid
    end

    it "is invalid with a negative amount" do
      expense = Expense.new(description: "Lunch", amount: -10.00, category: category, date: Date.current)

      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("must be greater than 0")
    end

    it "is invalid with a zero amount" do
      expense = Expense.new(description: "Lunch", amount: 0, category: category, date: Date.current)

      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("must be greater than 0")
    end

    it "is invalid with a non-numeric amount" do
      expense = Expense.new(description: "Lunch", amount: "not-a-number", category: category, date: Date.current)

      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("is not a number")
    end
  end
end
