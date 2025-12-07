/**
 * Food React Query Hooks
 *
 * Custom hooks for food-related queries and mutations
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '../food';
import { foodKeys, foodQueries } from '../queries/food.queries';
/**
 * Hook to get all foods with optional filters
 * Optimized for admin panel with longer cache
 * IMPORTANT: Quando cambiano i params (es. page), React Query rifa automaticamente il fetch
 * perché la queryKey cambia. Non usare refetchOnMount: false per evitare problemi di paginazione.
 */
export function useFoods(params, initialData) {
    return useQuery({
        queryKey: foodKeys.list(params),
        queryFn: () => foodQueries.list(params),
        // IMPORTANTE: initialData viene usato solo se non ci sono dati in cache per questa queryKey
        // Quando cambia la pagina, la queryKey cambia, quindi React Query fa un nuovo fetch
        initialData: initialData,
        // IMPORTANTE: placeholderData invece di initialData potrebbe essere meglio per la paginazione,
        // ma usiamo initialData per la prima pagina e lasciamo che React Query faccia il fetch per le altre
        staleTime: 10 * 60 * 1000, // 10 minutes for admin
        gcTime: 30 * 60 * 1000, // 30 minutes cache
        refetchOnWindowFocus: false,
        // refetchOnMount: true di default - quando cambia la queryKey (es. page), rifa il fetch
        // Questo è fondamentale per la paginazione: ogni pagina ha una queryKey diversa
        // IMPORTANTE: Quando cambia la queryKey, React Query crea una nuova query e fa il fetch
        // anche se i dati sono "freschi" (staleTime). Questo garantisce che la paginazione funzioni correttamente.
    });
}
/**
 * Hook to get a food by ID
 */
export function useFood(id) {
    return useQuery({
        queryKey: foodKeys.detail(id),
        queryFn: () => foodQueries.getById(id),
        enabled: !!id,
    });
}
/**
 * Hook to create a food
 */
export function useCreateFood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => foodApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
        },
    });
}
/**
 * Hook to update a food
 */
export function useUpdateFood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => foodApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
            queryClient.invalidateQueries({ queryKey: foodKeys.detail(variables.id) });
        },
    });
}
/**
 * Hook to delete a food
 */
export function useDeleteFood() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => foodApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
        },
    });
}
/**
 * Hook to update a food using AI
 */
export function useUpdateFoodWithAI() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data, }) => foodApi.updateWithAI(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
            queryClient.invalidateQueries({ queryKey: foodKeys.detail(variables.id) });
        },
    });
}
/**
 * Hook for batch operations (delete, update)
 *
 * NOTA: Non usa optimistic updates perché il realtime (Zustand) aggiorna
 * automaticamente il cache React Query quando le modifiche arrivano dal database.
 * Il realtime è gestito globalmente tramite useRealtimeSubscription che usa
 * useRealtimeStore (Zustand) per una singola subscription condivisa.
 */
export function useBatchFoodOperations() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ action, ids, data, }) => foodApi.batch(action, ids, data),
        onSuccess: () => {
            // Il realtime aggiornerà automaticamente il cache, ma invalidiamo
            // per sicurezza in caso di problemi di sincronizzazione
            queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
        },
    });
}
