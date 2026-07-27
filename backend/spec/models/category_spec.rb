require 'rails_helper'

RSpec.describe Category, type: :model do
  describe "validations" do
    it "is valid with a name" do
      category = Category.new(name: "Groceries")
      expect(category).to be_valid
    end

    it "requires a name" do
      category = Category.new(name: "")
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("can't be blank")
    end

    it "rejects duplicate names case-insensitively" do
      Category.create!(name: "Food")
      duplicate = Category.new(name: "food")

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to include("has already been taken")
    end

    it "rejects a name longer than the DB column limit" do
      category = Category.new(name: "A" * 101)

      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("is too long (maximum is 100 characters)")
    end

    it "rejects an emoji longer than the DB column limit" do
      category = Category.new(name: "Groceries", emoji: "1" * 11)

      expect(category).not_to be_valid
      expect(category.errors[:emoji]).to include("is too long (maximum is 10 characters)")
    end
  end

  describe "emoji default" do
    it "defaults to the fallback emoji when not provided" do
      category = Category.create!(name: "Groceries")
      expect(category.emoji).to eq(Category::DEFAULT_EMOJI)
    end

    it "keeps an explicitly provided emoji" do
      category = Category.create!(name: "Groceries", emoji: "🛒")
      expect(category.emoji).to eq("🛒")
    end

    it "falls back to the default emoji when given a blank string" do
      category = Category.create!(name: "Groceries", emoji: "")
      expect(category.emoji).to eq(Category::DEFAULT_EMOJI)
    end
  end
end
