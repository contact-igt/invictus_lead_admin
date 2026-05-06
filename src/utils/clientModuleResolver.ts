import { ClientRegistry } from 'config/clients';
import { normalizeClientKey, SUPPORTED_CLIENT_MODULES } from './clientKey';

const MODULE_ALIASES: Record<string, string> = {
    pixel_eye: 'pixeleye',
    pixel_eye_hospital: 'pixeleye',
    pixel: 'pixeleye',
    vlslaw: 'vls_law',
    vls: 'vls_law',
};

const registryKeys = SUPPORTED_CLIENT_MODULES.filter((key) => Boolean(ClientRegistry[key]));

export const resolveClientModuleKey = (tenantClientKey?: string | null): string => {
    const normalized = normalizeClientKey(tenantClientKey);
    if (!normalized) return '';

    if (ClientRegistry[normalized]) {
        return normalized;
    }

    const alias = MODULE_ALIASES[normalized];
    if (alias && ClientRegistry[alias]) {
        return alias;
    }

    const byBoundaryMatch = registryKeys.find(
        (moduleKey) =>
            normalized.startsWith(`${moduleKey}_`) ||
            normalized.endsWith(`_${moduleKey}`) ||
            normalized.includes(`_${moduleKey}_`),
    );

    if (byBoundaryMatch) {
        return byBoundaryMatch;
    }

    if (normalized.includes('pixel')) return 'pixeleye';
    if (normalized.includes('vls')) return 'vls_law';

    return '';
};
