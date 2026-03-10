require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food", emoji: "🍔") }
  let!(:transport_category) { Category.create!(name: "Transport", emoji: "🚗") }

  describe "GET /api/expenses" do
    let!(:expense1) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today) }
    let!(:expense2) { Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.today) }

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json.map { |e| e["category"] }).to include("Food", "Transport")
    end

    it "returns expenses in descending order by created_at" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(expense2.id)
      expect(json.last["id"]).to eq(expense1.id)
    end

    context "with month and year filter" do
      it "returns expenses for the given month and year" do
        get "/api/expenses", params: { year: Date.today.year, month: Date.today.month }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json.length).to eq(2)
      end

      it "returns empty array for month with no expenses" do
        get "/api/expenses", params: { year: 2000, month: 1 }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json).to be_empty
      end
    end
  end

  describe "POST /api/expenses" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          expense: {
            description: "Team Lunch",
            amount: 150.50,
            category: food_category.name,
            date: Date.today
          }
        }
      end

      it "creates a new expense" do
        expect {
          post "/api/expenses", params: valid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to eq(150.5)
        expect(json["category"]).to eq("Food")
      end
    end

    context "with invalid parameters" do
      it "returns not found for non-existent category" do
        invalid_params = {
          expense: {
            description: "Lunch",
            amount: 100.00,
            category: "NonExistent",
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/expenses/:id" do
    let!(:expense) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today) }

    context "with valid parameters" do
      it "updates the description" do
        patch "/api/expenses/#{expense.id}", params: { expense: { description: "Updated Lunch" } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Updated Lunch")
      end

      it "updates the amount" do
        patch "/api/expenses/#{expense.id}", params: { expense: { amount: 200.00 } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["amount"]).to eq(200.0)
      end

      it "updates the category" do
        patch "/api/expenses/#{expense.id}", params: { expense: { category: transport_category.name } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["category"]).to eq("Transport")
      end
    end

    context "with invalid parameters" do
      it "returns not found for non-existent expense" do
        patch "/api/expenses/99999", params: { expense: { description: "Ghost" } }, as: :json

        expect(response).to have_http_status(:not_found)
      end

      it "returns not found for non-existent category" do
        patch "/api/expenses/#{expense.id}", params: { expense: { category: "NonExistent" } }, as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/expenses/:id" do
    let!(:expense) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today) }

    it "deletes the expense" do
      expect {
        delete "/api/expenses/#{expense.id}"
      }.to change(Expense, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for non-existent expense" do
      delete "/api/expenses/99999"

      expect(response).to have_http_status(:not_found)
    end
  end
end
