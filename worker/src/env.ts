export interface Env {
  GOOGLE_CLIENT_ID: string;
  ALLOWED_ORIGINS: string;
  ALLOWED_EMAIL: string;
  APPS_SCRIPT_URL: string;
  APPS_SCRIPT_GATEWAY_SECRET: string;
}

export interface AuthorizedUser {
  email: string;
  name: string | null;
  picture: string | null;
}
