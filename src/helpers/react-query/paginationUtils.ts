import type { QueryClient, QueryKey } from "@tanstack/react-query";

export interface PaginatedResponse<T> {
  pages: { data: T[] }[];
  pageParams: unknown[];
}

/**
 * Updates an item in paginated data.
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param predicate - A function to identify the item to update.
 * @param updater - A function to update the item.
 */
export function updateItemInPaginatedData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): void {
  queryClient.setQueryData<PaginatedResponse<T>>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData?.pages?.map((page) => ({
        ...page,
        data: page?.data?.map((item) =>
          predicate(item) ? updater(item) : item
        ),
      })),
    };
  });
}

/**
 * Removes an item from paginated data.
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param predicate - A function to identify the item to remove.
 */
export function removeItemFromPaginatedData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  predicate: (item: T) => boolean
): void {
  queryClient.setQueryData<PaginatedResponse<T>>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData?.pages?.map((page) => ({
        ...page,
        data: page?.data?.filter((item) => !predicate(item)),
      })),
    };
  });
}

/**
 * Adds an item to paginated data.
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param newItem - The new item to add.
 * @param position - The position to add the item ('start' or 'end').
 */
export function addItemToPaginatedData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  newItem: T,
  position: "start" | "end" = "start"
): void {
  queryClient.setQueryData<PaginatedResponse<T>>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    const newPages = oldData?.pages?.map((page, index) => {
      if (position === "start" && index === 0) {
        return {
          ...page,
          data: [newItem, ...page?.data],
        };
      } else if (position === "end" && index === oldData?.pages?.length - 1) {
        return {
          ...page,
          data: [...page?.data, newItem],
        };
      }
      return page;
    });

    return {
      ...oldData,
      pages: newPages,
    };
  });
}

/**
 * Updates an item in paginated data for all queries containing a specific query key.
 * @param queryClient - The React Query client.
 * @param targetQueryKey - The specific query key to target (e.g., [queries.GET_FOLLOWERS]).
 * @param predicate - A function to identify the item to update.
 * @param updater - A function to update the item.
 */
export function updateItemInPaginatedQueriesMatchAllKeys<T>(
  queryClient: QueryClient,
  targetQueryKey: QueryKey,
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): void {
  queryClient
    .getQueriesData<PaginatedResponse<T>>({})
    ?.forEach(([queryKey, queryData]) => {
      if (Array.isArray(queryKey) && queryKey?.includes(targetQueryKey?.[0])) {
        queryClient.setQueryData<PaginatedResponse<T>>(queryKey, (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData?.pages?.map((page) => ({
              ...page,
              data: page?.data?.map((item) =>
                predicate(item) ? updater(item) : item
              ),
            })),
          };
        });
      }
    });
}
