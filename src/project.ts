export interface EngineBuild {
  engineVersion: string;
  commitSha: string | null;
}

export const PROJECT_CONFIG = __PROJECT_CONFIG__;
export const REPOSITORY_URL = PROJECT_CONFIG.repositoryUrl;
export const LICENSE_URL = `${REPOSITORY_URL}/blob/main/${PROJECT_CONFIG.licensePath}`;
export const BUILD_INFO = PROJECT_CONFIG.build;

export function commitUrl(sha: string | null | undefined): string | null {
  return typeof sha === 'string' && /^[a-f\d]{40}$/i.test(sha)
    ? `${REPOSITORY_URL}/commit/${sha.toLowerCase()}`
    : null;
}

export function buildReference(build: EngineBuild | undefined): { version: string; shortSha: string | null; url: string | null } {
  if (!build || typeof build.engineVersion !== 'string' || !build.engineVersion.trim()) {
    return { version: 'Versión no registrada', shortSha: null, url: null };
  }
  return {
    version: build.engineVersion,
    shortSha: build.commitSha && commitUrl(build.commitSha) ? build.commitSha.slice(0, 7) : null,
    url: commitUrl(build.commitSha)
  };
}
