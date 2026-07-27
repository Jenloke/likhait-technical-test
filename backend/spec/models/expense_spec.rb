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

  describe "date validation with a client time zone offset" do
    include ActiveSupport::Testing::TimeHelpers

    it "treats a date as valid if it's still today in the client's time zone, even if it's tomorrow in UTC" do
      travel_to Time.utc(2026, 7, 27, 23, 0, 0) do
        # UTC+8 client (offset -480 minutes): local date is 2026-07-28 while the server's UTC date is still 2026-07-27
        expense = Expense.new(
          description: "Late night snack", amount: 5.00, category: category,
          date: Date.new(2026, 7, 28), timezone_offset_minutes: -480
        )

        expect(expense).to be_valid
      end
    end

    it "still rejects a date beyond the client's local today" do
      travel_to Time.utc(2026, 7, 27, 23, 0, 0) do
        expense = Expense.new(
          description: "Too far ahead", amount: 5.00, category: category,
          date: Date.new(2026, 7, 29), timezone_offset_minutes: -480
        )

        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("must be less than or equal to 2026-07-28")
      end
    end

    it "falls back to the server's UTC date when no offset is given" do
      travel_to Time.utc(2026, 7, 27, 23, 0, 0) do
        expense = Expense.new(
          description: "No offset", amount: 5.00, category: category, date: Date.new(2026, 7, 28)
        )

        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("must be less than or equal to 2026-07-27")
      end
    end

    it "clamps an implausibly large offset instead of letting it validate an arbitrary future date" do
      travel_to Time.utc(2026, 7, 27, 23, 0, 0) do
        expense = Expense.new(
          description: "Spoofed offset", amount: 5.00, category: category,
          date: Date.new(2030, 1, 1), timezone_offset_minutes: -999_999_999
        )

        expect(expense).not_to be_valid
      end
    end

    it "still honors the most extreme real-world offset ahead of UTC (UTC+14, Kiribati)" do
      travel_to Time.utc(2026, 7, 27, 23, 0, 0) do
        utc_plus_14 = Expense.new(
          description: "Kiribati", amount: 5.00, category: category,
          date: Date.new(2026, 7, 28), timezone_offset_minutes: -840
        )

        expect(utc_plus_14).to be_valid
      end
    end

    it "still honors the most extreme real-world offset behind UTC (UTC-12, Baker Island)" do
      travel_to Time.utc(2026, 7, 27, 5, 0, 0) do
        # UTC-12 (offset +720): local time is 12h behind, so it's still 2026-07-26 there
        utc_minus_12 = Expense.new(
          description: "Baker Island", amount: 5.00, category: category,
          date: Date.new(2026, 7, 26), timezone_offset_minutes: 720
        )

        expect(utc_minus_12).to be_valid
      end
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
