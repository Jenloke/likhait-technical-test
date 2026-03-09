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

  describe "PATCH /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food", emoji: "🍔") }

    context "with valid parameters" do
      it "updates the category name" do
        patch "/api/categories/#{category.name}", params: { category: { name: "Groceries" } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Groceries")
      end

      it "updates the category emoji" do
        patch "/api/categories/#{category.name}", params: { category: { emoji: "🥗" } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["emoji"]).to eq("🥗")
      end

      it "updates both name and emoji" do
        patch "/api/categories/#{category.name}", params: { category: { name: "Groceries", emoji: "🥗" } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Groceries")
        expect(json["emoji"]).to eq("🥗")
      end
    end

    context "with invalid parameters" do
      it "with missing name" do
        patch "/api/categories/#{category.name}", params: { category: { name: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "with missing emoji" do
        patch "/api/categories/#{category.name}", params: { category: { emoji: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Emoji can't be blank")
      end

      it "with duplicate name" do
        Category.create!(name: "Transport", emoji: "🚗")

        patch "/api/categories/#{category.name}", params: { category: { name: "Transport" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end

      it "returns not found for non-existent category" do
        patch "/api/categories/NonExistent", params: { category: { name: "Ghost" } }, as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food", emoji: "🍔") }

    it "deletes the category" do
      expect {
        delete "/api/categories/#{category.name}"
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for non-existent category" do
      delete "/api/categories/NonExistent"

      expect(response).to have_http_status(:not_found)
    end

    it "cannot delete a category that has expenses" do
      Expense.create!(description: "Lunch", amount: 100.00, category: category, date: Date.today)

      expect {
        delete "/api/categories/#{category.name}"
      }.not_to change(Category, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Cannot delete category with existing expenses")
    end
  end
end
