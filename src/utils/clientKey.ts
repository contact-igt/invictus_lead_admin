const CLIENT_KEY_ALIASES: Record<string, string> = {
    pixel_eye: 'pixeleye',
    vlslaw: 'vls_law',
};

export const SUPPORTED_CLIENT_MODULES = ['pixeleye', 'vls_law'] as const;
export type SupportedClientModule = typeof SUPPORTED_CLIENT_MODULES[number];

export const CLIENT_MODULE_OPTIONS: Array<{ label: string; value: SupportedClientModule }> = [
    { label: 'PixelEye', value: 'pixeleye' },
    { label: 'VLS Law', value: 'vls_law' },
];

export const normalizeClientKey = (key?: string | null): string => {
    if (!key) return '';
    const normalized = key
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '_');
    return CLIENT_KEY_ALIASES[normalized] || normalized;
};

export const normalizeClientSegment = (segment?: string | null): string => {
    if (!segment) return '';

    return String(segment)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const splitClientKeyForForm = (key?: string | null): { moduleKey: SupportedClientModule | ''; tenantKey: string } => {
    const normalized = normalizeClientKey(key);
    if (!normalized) {
        return { moduleKey: '', tenantKey: '' };
    }

    const moduleKey = SUPPORTED_CLIENT_MODULES.find(
        (candidate) => normalized === candidate || normalized.startsWith(`${candidate}_`),
    ) || '';

    if (!moduleKey) {
        return { moduleKey: '', tenantKey: normalized };
    }

    const tenantKey = normalized === moduleKey ? '' : normalized.slice(moduleKey.length + 1);
    return { moduleKey, tenantKey };
};

export const buildClientKey = (moduleKey: SupportedClientModule, tenantKey?: string | null): string => {
    const normalizedModule = normalizeClientKey(moduleKey) as SupportedClientModule;
    const normalizedTenant = normalizeClientSegment(tenantKey);
    return normalizedTenant ? `${normalizedModule}_${normalizedTenant}` : normalizedModule;
};
