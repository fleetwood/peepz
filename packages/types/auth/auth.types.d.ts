export type ContinueAfterAuthResult<TEnsureMemberResponse> = {
    kind: 'ok';
    data: TEnsureMemberResponse;
} | {
    kind: 'link_required';
    provider: string | null;
};
export type EnsureAuthIdentity = {
    provider: string;
    providerUserId: string;
    email?: string | null;
    rawProfile?: unknown;
};
export type ProviderProfilePatch = {
    firstName?: string;
    lastName?: string;
    preferredName?: string;
    avatarUrl?: string;
    name?: string[];
};
//# sourceMappingURL=auth.types.d.ts.map