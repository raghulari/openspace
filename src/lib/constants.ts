import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Calendar,
  Bot,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ─── Navigation ──────────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "AI Copilot",
    href: "/dashboard/copilot",
    icon: Bot,
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// ─── Invoice Statuses ────────────────────────────────────────

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-800" },
  { value: "viewed", label: "Viewed", color: "bg-yellow-100 text-yellow-800" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]["value"];

// ─── Document Categories ─────────────────────────────────────

export const DOCUMENT_CATEGORIES = [
  { value: "contract", label: "Contracts" },
  { value: "proposal", label: "Proposals" },
  { value: "report", label: "Reports" },
  { value: "meeting_notes", label: "Meeting Notes" },
  { value: "financial", label: "Financial" },
  { value: "legal", label: "Legal" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

// ─── Workspace Roles ─────────────────────────────────────────

export const WORKSPACE_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]["value"];

// ─── App Constants ───────────────────────────────────────────

export const APP_NAME = "Onespace AI";
export const APP_DESCRIPTION =
  "Centralize knowledge, automate workflows, manage customers, and get AI-powered business insights.";

export const ITEMS_PER_PAGE = 20;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

// ─── Date/Time ───────────────────────────────────────────────

export const DATE_FORMAT = "dd MMM yyyy";
export const TIME_FORMAT = "hh:mm a";
export const DATETIME_FORMAT = "dd MMM yyyy, hh:mm a";
