export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 10,
    maxLimit: 100,
    minLimit: 1
} as const;

export const PAGINATION_ERRORS = {
    INVALID_PAGE: "Invalid page number. Page must be a positive integer.",
    INVALID_LIMIT: "Invalid limit. Limit must be between 1 and 100.",
    PAGE_NOT_EXISTS: (page: number, totalPages: number) =>
        `Page ${page} does not exist. Total pages: ${totalPages}`
} as const;
