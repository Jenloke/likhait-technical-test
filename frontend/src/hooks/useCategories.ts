// hooks/useCategories.ts
import { useState, useEffect } from "react";
import { fetchCategories } from "../services/api";
// import { fetchCategories } from "@/lib/api";

export interface Category {
  name: string;
  emoji: string;
}

let cachedCategories: Category[] = [];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories);
  const [loading, setLoading] = useState(cachedCategories.length === 0);

  useEffect(() => {
    if (cachedCategories.length > 0) return;

    fetchCategories().then((data) => {
      cachedCategories = data;
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const getCategoryEmoji = (name: string): string => {
    return categories.find((c) => c.name === name)?.emoji ?? "❓";
  };

  return { categories, loading, getCategoryEmoji };
}