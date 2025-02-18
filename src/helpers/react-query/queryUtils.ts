import type { QueryClient } from "@tanstack/react-query";

/**
 * Updates an item in the query data.
 *
 * @example
 * const queryClient = new QueryClient();
 * const queryKey = ['todos'];
 * const predicate = (item: Todo) => item.id === 1;
 * const updater = (item: Todo) => ({ ...item, completed: true });
 *
 * updateItemInQueryData(queryClient, queryKey, predicate, updater);
 *
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param predicate - A function to identify the item to update.
 * @param updater - A function to update the item.
 */
export function updateItemInQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): void {
  queryClient.setQueryData<T[]>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return oldData?.map((item) => (predicate(item) ? updater(item) : item));
  });
}

/**
 * Removes an item from the query data.
 *
 * @example
 * const queryClient = new QueryClient();
 * const queryKey = ['todos'];
 * const predicate = (item: Todo) => item.id === 1;
 *
 * removeItemFromQueryData(queryClient, queryKey, predicate);
 *
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param predicate - A function to identify the item to remove.
 */
export function removeItemFromQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  predicate: (item: T) => boolean
): void {
  queryClient.setQueryData<T[]>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return oldData?.filter((item) => !predicate(item));
  });
}

/**
 * Adds an item to the query data.
 *
 * @example
 * const queryClient = new QueryClient();
 * const queryKey = ['todos'];
 * const newItem = { id: 2, text: 'New Todo', completed: false };
 *
 * addItemToQueryData(queryClient, queryKey, newItem, 'start');
 *
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param newItem - The new item to add.
 * @param position - The position to add the item ('start' or 'end').
 */
export function addItemToQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  newItem: T,
  position: "start" | "end" = "start"
): void {
  queryClient.setQueryData<T[]>(queryKey, (oldData) => {
    if (!oldData) return [newItem];

    return position === "start" ? [newItem, ...oldData] : [...oldData, newItem];
  });
}

/**
 * Updates the entire query data.
 *
 * @example
 * const queryClient = new QueryClient();
 * const queryKey = ['todos'];
 * const updater = (data: Todo[]) => data.map(item => ({ ...item, completed: true }));
 *
 * updateQueryData(queryClient, queryKey, updater);
 *
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param updater - A function to update the entire data array.
 */
export function updateQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (data: T[]) => T[]
): void {
  queryClient.setQueryData<T[]>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return updater(oldData);
  });
}

/**
 * Updates the entire query data for an object.
 *
 * @example
 * const queryClient = new QueryClient();
 * const queryKey = ['orderBook'];
 * const updater = (oldData: IOrderBook) => ({ ...oldData, sellOrders: [], buyOrders: [], betOption: "Yes", last: 64, spread: 3 });
 *
 * updateObjectInQueryData(queryClient, queryKey, updater);
 *
 * @param queryClient - The React Query client.
 * @param queryKey - The query key for the data.
 * @param updater - A function to update the entire data object.
 */
export function updateObjectInQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (oldData: T) => T
): void {
  queryClient.setQueryData<T>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return updater(oldData);
  });
}
