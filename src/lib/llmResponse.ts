// simple interface for the response data from the query route
export interface LlmResponseData {
  files: string[];
  content: string[];
  answer: string;
}

export interface GetRepo {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface GetTenants {
  tenants: Array<{
    id: string;
    name: string;
  }>;
}
