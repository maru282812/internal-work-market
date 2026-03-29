"use client";

import { Chip } from "@heroui/react";
import type { PostWithRelations } from "@/types/database";

interface PostListItemProps {
  post: PostWithRelations;
  isSelected: boolean;
  onClick: () => void;
}

export function PostListItem({ post, isSelected, onClick }: PostListItemProps) {
  const isOfficial = post.post_type === "OFFICIAL";
  const deadline = post.deadline_at
    ? new Date(post.deadline_at).toLocaleDateString("ja-JP")
    : null;
  const createdAt = new Date(post.created_at).toLocaleDateString("ja-JP");
  const userName = post.users?.display_name ?? "匿名";
  const companyName = post.companies?.name ?? "会社不明";

  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-lg cursor-pointer border transition-all select-none
        ${
          isSelected
            ? "bg-primary-50 border-primary-300 shadow-sm"
            : "bg-white border-default-100 hover:bg-default-50 hover:border-default-200"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <Chip
          size="sm"
          color={isOfficial ? "primary" : "success"}
          variant="flat"
          className="shrink-0"
        >
          {isOfficial ? "公式" : "気軽"}
        </Chip>
        {isOfficial && post.price_text && (
          <span className="text-xs font-semibold text-primary shrink-0">
            {post.price_text}
          </span>
        )}
      </div>

      <h3
        className={`text-sm font-semibold line-clamp-2 mb-1 ${
          isSelected ? "text-primary-700" : "text-default-800"
        }`}
      >
        {post.title}
      </h3>

      <p className="text-xs text-default-400">{companyName}</p>

      <div className="flex gap-3 mt-1">
        {isOfficial && deadline ? (
          <p className="text-xs text-default-400">締切: {deadline}</p>
        ) : (
          <p className="text-xs text-default-400">投稿日: {createdAt}</p>
        )}
        {!isOfficial && (
          <p className="text-xs text-default-400">{userName}</p>
        )}
      </div>
    </div>
  );
}
