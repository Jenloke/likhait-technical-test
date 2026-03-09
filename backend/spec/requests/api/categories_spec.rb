require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food", emoji: "🍔") }
    let!(:transport) { Category.create!(name: "Transport", emoji: "🚗") }
    let!(:entertainment) { Category.create!(name: "Entertainment", emoji: "🎬") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Entertainment")
      expect(json.map { |c| c["emoji"] }).to include("🍔", "🚗", "🎬")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Entertainment", "Food", "Transport" ])
      expect(json.map { |c| c["emoji"] }).to eq([ "🎬", "🍔", "🚗" ])
    end
  end

  describe "POST /api/categories" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          category: {
            name: "Entertainment",
            emoji: "🎬"
          }
        }
      end

      it "creates a new category" do
        expect {
          post "/api/categories", params: valid_params, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)

        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Entertainment")
        expect(json["emoji"]).to eq("🎬")
      end
    end

    context "with invalid parameters" do
      it "with missing name" do
        invalid_params = {
          category: {
            name: "",
            emoji: "🎬"
          }
        }

        expect {
          post "/api/categories", params: invalid_params, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "with missing emoji" do
        invalid_params = {
          category: {
            name: "Entertainment",
            emoji: ""
          }
        }

        expect {
          post "/api/categories", params: invalid_params, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Emoji can't be blank")
      end

      it "with duplicate name" do
        Category.create!(name: "Utilities", emoji: "💡")

        invalid_params = {
          category: {
            name: "Utilities",
            emoji: "💡"
          }
        }

        expect {
          post "/api/categories", params: invalid_params, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_content)

        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end
    end
  end
end
