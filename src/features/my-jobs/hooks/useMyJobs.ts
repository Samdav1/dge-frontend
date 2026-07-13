import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listServices, createService, updateService, deleteService, listWorkSubmissions, getWorkSubmission, submitWork } from "../actions";
import { listMyEscrows, getEscrow, releaseEscrow, refundEscrow, disputeEscrow } from "../../escrow/actions";

// ... existing hooks ...

export function useWorkSubmissionDetails(id: string) {
    return useQuery({
        queryKey: ["work-submission", id],
        queryFn: async () => {
            const result = await getWorkSubmission(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useMyServices() {
    return useQuery({
        queryKey: ["my-services"],
        queryFn: async () => {
            const result = await listServices(true);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });
}

export function useMyOngoingJobs() {
    return useQuery({
        queryKey: ["my-ongoing-jobs"],
        queryFn: async () => {
            const result = await listMyEscrows();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });
}

export function useMySubmittedJobs() {
    return useQuery({
        queryKey: ["my-submitted-jobs"],
        queryFn: async () => {
            const result = await listWorkSubmissions();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });
}

export function useOngoingJobDetails(id: string) {
    return useQuery({
        queryKey: ["ongoing-job", id],
        queryFn: async () => {
            const result = await getEscrow(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createService(formData);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
}

export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const result = await updateService(id, formData);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["my-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            queryClient.invalidateQueries({ queryKey: ["service", variables.id] });
        },
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteService(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-services"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
}

export function useSubmitWork() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await submitWork(formData);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            const escrowId = variables.get("escrow_id") as string;
            queryClient.invalidateQueries({ queryKey: ["my-submitted-jobs"] });
            if (escrowId) {
                queryClient.invalidateQueries({ queryKey: ["ongoing-job", escrowId] });
            }
        },
    });
}

export function useReleaseEscrow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ escrowId, rating, review_comment, direct_message }: { escrowId: string; rating?: number; review_comment?: string; direct_message?: string }) => {
            const result = await releaseEscrow(escrowId, { rating, review_comment, direct_message });
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ongoing-job", variables.escrowId] });
            queryClient.invalidateQueries({ queryKey: ["my-ongoing-jobs"] });
        }
    });
}

export function useRefundEscrow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (escrowId: string) => {
            const result = await refundEscrow(escrowId);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (data, escrowId) => {
            queryClient.invalidateQueries({ queryKey: ["ongoing-job", escrowId] });
            queryClient.invalidateQueries({ queryKey: ["my-ongoing-jobs"] });
        }
    });
}

export function useDisputeEscrow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ escrowId, direct_message }: { escrowId: string; direct_message?: string }) => {
            const result = await disputeEscrow(escrowId, { direct_message });
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ongoing-job", variables.escrowId] });
            queryClient.invalidateQueries({ queryKey: ["my-ongoing-jobs"] });
        }
    });
}


