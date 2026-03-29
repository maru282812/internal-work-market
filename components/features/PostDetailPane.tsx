"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Chip, Divider, Button } from "@heroui/react";
import { ApplicationModal } from "@/components/common/ApplicationModal";
import type { PostWithRelations, ApplicationType } from "@/types/database";

interface PostDetailPaneProps {
  post: PostWithRelations;
}

export function PostDetailPane({ post }: PostDetailPaneProps) {
  const [modalType, setModalType] = useState<ApplicationType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOfficial = post.post_type === "OFFICIAL";
  const deadline = post.deadline_at
    ? new Date(post.deadline_at).toLocaleDateString("ja-JP")
    : null;
  const createdAt = new Date(post.created_at).toLocaleDateString("ja-JP");
  const publishedAt = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : null;
  const userName = post.users?.display_name ?? "匿名";
  const companyName = post.companies?.name ?? "会社不明";

  const handleSuccess = (type: ApplicationType) => {
    if (type === "APPLY") {
      setSuccessMessage(
        isOfficial
          ? "応募を送信しました。担当者からの連絡をお待ちください。"
          : "参加希望を送信しました。投稿者からの連絡をお待ちください。"
      );
    } else {
      setSuccessMessage("お問い合わせを送信しました。担当者からの連絡をお待ちください。");
    }
    setModalType(null);
  };

  return (
    <div>
      {successMessage && (
        <div className="mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <p className="text-sm text-emerald-700 font-medium">✓ {successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 text-xl leading-none ml-4"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}

      <Card shadow="sm">
        <CardHeader className="flex flex-col items-start gap-3 pb-3">
          {/* Type + status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" color={isOfficial ? "primary" : "success"} variant="flat">
              {isOfficial ? "公式案件" : "気軽に投稿"}
            </Chip>
            {post.post_status === "PUBLISHED" && (
              <Chip size="sm" color="success" variant="flat">公開中</Chip>
            )}
            {post.post_status === "CLOSED" && (
              <Chip size="sm" color="default" variant="flat">終了</Chip>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-default-900 leading-snug">{post.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-500">
            <span>{companyName}</span>
            {isOfficial && post.price_text && (
              <span className="font-semibold text-primary">💰 {post.price_text}</span>
            )}
            {isOfficial && post.contact_person_name && (
              <span>担当: {post.contact_person_name}</span>
            )}
            {isOfficial && deadline && (
              <span>締切: {deadline}</span>
            )}
            {isOfficial && publishedAt && (
              <span>掲載日: {publishedAt}</span>
            )}
            {!isOfficial && (
              <span>投稿者: {userName}</span>
            )}
            <span>投稿日: {createdAt}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full pt-1">
            <Button
              color="primary"
              size="md"
              onPress={() => setModalType("APPLY")}
              className="flex-1"
            >
              {isOfficial ? "応募する" : "参加希望"}
            </Button>
            <Button
              color="secondary"
              variant="flat"
              size="md"
              onPress={() => setModalType("INQUIRY")}
              className="flex-1"
            >
              聞いてみる
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          <h2 className="text-sm font-semibold text-default-600 mb-3">
            {isOfficial ? "案件詳細" : "投稿内容"}
          </h2>
          <div className="whitespace-pre-wrap text-default-700 leading-relaxed text-sm">
            {post.body}
          </div>

          {isOfficial && post.application_limit && post.is_application_limit_enabled && (
            <div className="mt-4 p-3 bg-default-50 rounded-lg">
              <p className="text-xs text-default-500">
                募集人数: <span className="font-medium text-default-700">{post.application_limit}名</span>
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {modalType && (
        <ApplicationModal
          post={post}
          applicationType={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
          onSuccess={() => handleSuccess(modalType)}
        />
      )}
    </div>
  );
}
