import { companyInfo } from "config";

export const COOKIE_PREFIX = companyInfo.slug;
export const COOKIE_SESSION_TOKEN = `${COOKIE_PREFIX}.session_token`;