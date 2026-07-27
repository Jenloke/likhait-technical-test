require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    it "creates a category with the given name and emoji" do
      post "/api/categories", params: { category: { name: "Groceries", emoji: "🛒" } }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Groceries")
      expect(json["emoji"]).to eq("🛒")
    end

    it "defaults the emoji when none is given" do
      post "/api/categories", params: { category: { name: "Groceries" } }

      json = JSON.parse(response.body)
      expect(json["emoji"]).to eq(Category::DEFAULT_EMOJI)
    end

    it "rejects a blank name" do
      post "/api/categories", params: { category: { name: "" } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name can't be blank")
    end

    it "rejects a duplicate name case-insensitively" do
      Category.create!(name: "Food")

      post "/api/categories", params: { category: { name: "food" } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name has already been taken")
    end

    it "rejects a name longer than the DB column limit instead of raising" do
      post "/api/categories", params: { category: { name: "A" * 101 } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name is too long (maximum is 100 characters)")
    end

    it "rejects an emoji longer than the DB column limit instead of raising" do
      post "/api/categories", params: { category: { name: "Groceries", emoji: "1" * 11 } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Emoji is too long (maximum is 10 characters)")
    end

    it "gracefully handles a race where two requests pass validation before either commits" do
      allow_any_instance_of(Category).to receive(:save).and_raise(
        ActiveRecord::RecordNotUnique.new("Duplicate entry 'Food' for key 'categories.index_categories_on_name'")
      )

      post "/api/categories", params: { category: { name: "Food" } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Name has already been taken")
    end
  end
end
