import { canNavigateToFolder, getFolderMode, isBlockedPath } from "../config/folder-policy";
import type { DashboardSettings } from "../config/settings";
import { getSectionTitle, getSegmentLabel } from "./labels";
import type { DashboardRoute } from "./types";

export interface BreadcrumbItem {
  label: string;
  folderPath: string | null;
  clickable: boolean;
}

export function buildBreadcrumbs(
  route: DashboardRoute,
  settings: DashboardSettings
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: "知识库首页",
      folderPath: null,
      clickable: route.type !== "home",
    },
  ];

  if (route.type === "home") {
    return items;
  }

  let folderPath: string;
  if (route.type === "folder") {
    folderPath = route.path;
  } else {
    const parts = route.path.split("/");
    parts.pop();
    folderPath = parts.join("/");
  }

  if (!folderPath || isBlockedPath(folderPath, settings)) {
    return items;
  }

  const segments = folderPath.split("/");
  let accumulated = "";

  for (let i = 0; i < segments.length; i++) {
    accumulated = accumulated ? `${accumulated}/${segments[i]}` : segments[i];
    const path = accumulated;
    const label =
      i === 0
        ? getSectionTitle(path, settings.sections)
        : getSegmentLabel(segments[i]);
    const mode = getFolderMode(path, settings);
    const clickable =
      mode !== "hidden" &&
      canNavigateToFolder(path, settings) &&
      (route.type !== "folder" || route.path !== path);

    items.push({
      label,
      folderPath: path,
      clickable,
    });
  }

  if (route.type === "document") {
    const basename = route.path.split("/").pop() ?? route.path;
    const docLabel = basename.replace(/\.md$/i, "");
    items.push({
      label: docLabel,
      folderPath: null,
      clickable: false,
    });
  }

  return items;
}
