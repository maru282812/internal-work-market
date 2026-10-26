"use client";

// Server Component から HeroUI を使うための入口。
// Next 16（Turbopack 既定）は "@heroui/react" のバレルを RSC 側で丸ごと評価し、
// バレルが再エクスポートする VisuallyHidden（"use client" なし）経由で
// createContext が呼ばれてビルドが落ちる。ここを client 境界にして回避する。
// また Next 16 では RSC 内の next/link がサーバー用ラッパー関数になり、
// `as={Link}` のように props で渡せないため、client 参照としての NextLink もここから出す。
export {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
export { default as NextLink } from "next/link";
