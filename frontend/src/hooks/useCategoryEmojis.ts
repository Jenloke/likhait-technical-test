/**
 * Custom hook for fetching and caching category emojis
 */

import { useState, useEffect } from "react";
import { fetchCategories } from "../services/api";

export interface Category {
  name: string;
  emoji: string;
}

let cachedCategories: Category[] = [];

export function invalidateCategoriesEmojiCache() {
  cachedCategories = [];
}

export function useCategoriesEmoji() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories);
  const [loading, setLoading] = useState(cachedCategories.length === 0);

  useEffect(() => {
    if (cachedCategories.length > 0) return;

    setLoading(true);
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