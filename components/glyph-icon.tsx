import {
  ArrowLeft, ArrowRight, Bell, BookOpen, BriefcaseBusiness, Building2,
  CalendarDays, CarFront, ChartColumn, Check, CheckCheck, ChevronDown, ChevronLeft, Clock3,
  ChevronRight, Circle, CircleHelp, FileCheck, FileText, GitCompareArrows,
  HeartHandshake, House, Info, List, LockKeyhole, Mail, MapPin, Menu,
  MessageCircle, Minus, Plus, RefreshCw, Route, Search, Server, Settings, Square,
  ShieldCheck, Star, TriangleAlert, Upload, UserRound, UsersRound, X,
  type LucideIcon,
} from "lucide-react";

// Existing screen data uses these short identifiers. Render one consistent
// Lucide set without changing navigation, status values or application data.
const icons: Record<string, LucideIcon> = {
  "⌂": House, "♙": UserRound, "♟": UsersRound, "♧": GitCompareArrows,
  "◇": FileCheck, "♢": ShieldCheck, "▣": BriefcaseBusiness,
  "⌘": Route, "△": Building2, "▥": ChartColumn, "⌾": ShieldCheck,
  "▤": FileText, "☷": List, "⚙": Settings, "☰": Menu,
  "⌕": Search, "✓": Check, "✓✓": CheckCheck, "×": X, "✕": X,
  "↻": RefreshCw, "◴": CalendarDays, "◷": Clock3, "□": Square, "▧": Upload, "✉": Mail,
  "⚠": TriangleAlert, "⚕": ShieldCheck, "⌖": MapPin, "⌁": Route,
  "→": ArrowRight, "←": ArrowLeft, "↗": ArrowRight,
  "›": ChevronRight, "‹": ChevronLeft, "⌄": ChevronDown,
  "○": Circle, "★": Star, "☆": Star, "☎": Bell,
  "!": TriangleAlert, "?": CircleHelp, "+": Plus,
  shield: ShieldCheck, route: Route, chat: MessageCircle,
  people: UsersRound, heart: HeartHandshake, lock: LockKeyhole,
  minus: Minus, car: CarFront, i: Info, info: Info, server: Server, book: BookOpen,
};

export function GlyphIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? CircleHelp;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} className="inline-block shrink-0 align-middle not-italic" />;
}
