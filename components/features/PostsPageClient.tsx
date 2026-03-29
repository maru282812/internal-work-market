"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PostListItem } from "@/components/features/PostListItem";
import { PostDetailPane } from "@/components/features/PostDetailPane";
import type { PostWithRelations, PostType } from "@/types/database";

type TabType = "ALL" | PostType;

const TABS: { key: TabType; label: string }[] = [
  { key: "ALL", label: "すべて" },
  { key: "OFFICIAL", label: "公式案件" },
  { key: "CASUAL", label: "気軽に投稿" },
];

interface PostsPageClientProps {
  /** 新規投稿ボタンのリンク先。省略時はボタン非表示 */
  newPostHref?: string;
  /** 初期タブ。省略時は "ALL" */
  initialTab?: TabType;
}

export function PostsPageClient({ newPostHref, initialTab = "ALL" }: PostsPageClientProps) {
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    searchParams.get("post")
  );
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
  const [isMobileDetail, setIsMobileDetail] = useState(!!searchParams.get("post"));

  // Fetch posts list
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("posts")
        .select("*, companies(id, name), users:created_by_user_id(id, display_name, email)")
        .eq("post_status", "PUBLISHED")
        .order("created_at", { ascending: false });

      if (tab !== "ALL") {
        query = query.eq("post_type", tab);
      }
      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,body.ilike.%${search.trim()}%`
        );
      }

      const { data } = await query;
      setPosts((data as PostWithRelations[]) ?? []);
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchPosts, 300);
    return () => clearTimeout(debounce);
  }, [search, tab]);

  // Resolve selectedPost from list or fetch individually
  useEffect(() => {
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }
    const found = posts.find((p) => p.id === selectedPostId);
    if (found) {
      setSelectedPost(found);
      return;
    }
    // Not in current list (e.g. loaded from URL param) — fetch directly
    const fetchSingle = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("posts")
        .select("*, companies(id, name), users:created_by_user_id(id, display_name, email)")
        .eq("id", selectedPostId)
        .eq("post_status", "PUBLISHED")
        .single();
      setSelectedPost((data as PostWithRelations) ?? null);
    };
    fetchSingle();
  }, [selectedPostId, posts]);

  const handleSelectPost = useCallback((post: PostWithRelations) => {
    setSelectedPostId(post.id);
    setIsMobileDetail(true);
    // Update URL without full navigation (shallow)
    const url = new URL(window.location.href);
    url.searchParams.set("post", post.id);
    window.history.pushState({}, "", url.toString());
  }, []);

  const handleBackToList = useCallback(() => {
    setIsMobileDetail(false);
    setSelectedPostId(null);
    setSelectedPost(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    window.history.pushState({}, "", url.toString());
  }, []);

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    setSelectedPostId(null);
    setSelectedPost(null);
    setIsMobileDetail(false);
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Page header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-default-900">案件一覧</h1>
          <p className="text-sm text-default-500">公開中の案件・投稿一覧</p>
        </div>
        {newPostHref && (
          <Button as={Link} href={newPostHref} color="primary" size="sm">
            + 気軽に投稿
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-default-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-default-500 hover:text-default-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex gap-0 flex-1 min-h-0">
        {/* Left: List pane */}
        <div
          className={`
            flex-shrink-0 lg:w-80 xl:w-96 flex flex-col
            lg:border-r lg:border-default-100 lg:pr-4
            ${isMobileDetail ? "hidden lg:flex" : "flex w-full"}
          `}
        >
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="タイトル・本文で検索"
              value={search}
              onValueChange={setSearch}
              size="sm"
              startContent={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-default-400 shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pb-4">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg h-20 animate-pulse" />
                ))}
              </>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-default-400">
                <p>案件が見つかりませんでした</p>
                {search && (
                  <p className="text-xs mt-1">検索キーワードを変えてみてください</p>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostListItem
                  key={post.id}
                  post={post}
                  isSelected={post.id === selectedPostId}
                  onClick={() => handleSelectPost(post)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Detail pane */}
        <div
          className={`
            flex-1 min-w-0 lg:pl-6 overflow-y-auto pb-4
            ${isMobileDetail ? "block" : "hidden lg:block"}
          `}
        >
          {isMobileDetail && (
            <Button
              variant="flat"
              size="sm"
              onPress={handleBackToList}
              className="mb-4 lg:hidden"
            >
              ← 一覧に戻る
            </Button>
          )}

          {selectedPost ? (
            <PostDetailPane post={selectedPost} />
          ) : (
            <div className="hidden lg:flex items-center justify-center h-64 text-default-400">
              <div className="text-center">
                <div className="text-5xl mb-3 select-none">📋</div>
                <p className="text-sm">左の一覧から案件を選択してください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
