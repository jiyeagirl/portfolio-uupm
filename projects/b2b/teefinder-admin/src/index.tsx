"use client";

// 관리자 콘솔에 별도 URL(/b2b/teefinder-admin)을 주기 위한 얇은 엔트리.
// 실제 화면은 projects/b2b/teefinder/components/admin/ 안에 있음.
import { AdminApp } from "@/projects/b2b/teefinder/components/admin/admin-app";

export default function TeefinderAdmin() {
  return <AdminApp />;
}
