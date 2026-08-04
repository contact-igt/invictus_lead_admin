import { ClientRegistry } from 'config/clients';
import { extractClientModuleKey, normalizeClientKey } from './clientKey';

export const INVICTUS_CLIENT_KEY = 'invictus';

export const isInvictusClientKey = (key?: string | null): boolean => {
    const normalized = normalizeClientKey(key);
    return normalized === INVICTUS_CLIENT_KEY || normalized.startsWith(`${INVICTUS_CLIENT_KEY}_`);
};

export const resolveClientModuleKey = (tenantClientKey?: string | null): string => {
    // Invictus internal users have their own module key
    if (isInvictusClientKey(tenantClientKey)) return INVICTUS_CLIENT_KEY;
    const moduleKey = extractClientModuleKey(tenantClientKey);
    return moduleKey && ClientRegistry[moduleKey] ? moduleKey : '';
};

export const getClientHomePath = (tenantClientKey?: string | null): string => {
    const moduleKey = resolveClientModuleKey(tenantClientKey);

    switch (moduleKey) {
        case INVICTUS_CLIENT_KEY:
            return '/pages/enquiries/general';
        case 'aarav_eye_care':
            return `/pages/d/${moduleKey}/aarav-eye-care`;
        case 'antardrashti_netralaya':
            return `/pages/d/${moduleKey}/antardrashti-netralaya`;
        case 'rio':
            return `/pages/d/${moduleKey}/rio`;
        case 'shanti_eye_tech':
            return `/pages/d/${moduleKey}/shanti-eye-tech`;
        case 'phoenix_fitness':
            return `/pages/d/${moduleKey}/phoenix-fitness`;
        case 'pixeleye':
        case 'vls_law':
            return `/pages/d/${moduleKey}/overview`;
        default:
            return '/';
    }
};

